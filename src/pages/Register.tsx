import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { uploadProfileImage, uploadIdentityCardImage, compressImage } from "@/utils/imageUpload";
import { generateAffiliateCode, isValidAffiliateCode } from "@/utils/cardUtils";
import { Upload, X, Camera, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const { signUp } = useAuth();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Lock referral code if it comes from URL
  useEffect(() => {
    if (referralCode) {
      setIsReferralLocked(true);
      setFormData(prev => ({ ...prev, referral_code: referralCode }));
    }
  }, [referralCode]);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Mali",
    password: "",
    confirmPassword: "",
    referral_code: referralCode || "",
    physical_card_requested: false,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [identityCardImage, setIdentityCardImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [identityCardPreview, setIdentityCardPreview] = useState<string | null>(null);
  const [isReferralLocked, setIsReferralLocked] = useState(false);

  // Removed unused membership tiers - will be replaced with Supabase data

  // Redirect logic now handled after Supabase signup
  const shouldRedirectToDashboard = false;
  const shouldRedirectToPayment = false;

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("🚀 Starting registration process...", {
        email: data.email,
        fullName: data.full_name,
      });

      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Phone, country, city are required; email is optional
      if (!data.phone.trim()) {
        throw new Error("Phone number is required");
      }
      if (!data.country.trim()) {
        throw new Error("Country is required");
      }
      if (!data.city.trim()) {
        throw new Error("City is required");
      }

      // Enforce required images (DB constraints require these to be NOT NULL)
      if (!profileImage) {
        throw new Error("Profile image is required");
      }
      if (!identityCardImage) {
        throw new Error("Identity card image is required");
      }

      // Validate email format if provided
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!data.full_name.trim()) {
        throw new Error("Full name is required");
      }

      // Prepare the registration data
      const registrationData = {
        email: data.email.trim(),
        password: data.password,
        full_name: data.full_name.trim(),
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "Mali",
        referral_code: data.referral_code || "",
        physical_card_requested: data.physical_card_requested,
      };

      // Generate affiliate code only (card_identifier will be generated after membership purchase)
      const affiliateCode = generateAffiliateCode();
      const referrerAffCode = data.referral_code && isValidAffiliateCode(data.referral_code)
        ? data.referral_code
        : null;

      // Use email or phone as auth identifier (email is optional)
      const authEmail = registrationData.email || `${registrationData.phone}@temp.elverra.ml`;
      
      // Supabase sign up
      const { data: supa, error } = await signUp(authEmail, registrationData.password, {
        full_name: registrationData.full_name,
        phone: registrationData.phone,
        referral_code: registrationData.referral_code,
        physical_card_requested: registrationData.physical_card_requested,
        affiliate_code: affiliateCode,
        ...(referrerAffCode ? { referrer_affiliate_code: referrerAffCode } : {}),
        // pass location metadata for server trigger to mirror into profiles
        ...(registrationData.country ? { country: registrationData.country } : {} as any),
        ...(registrationData.city ? { city: registrationData.city } : {} as any),
      });
      if (error) {
        throw new Error(error);
      }

      // Upload images if provided
      let profileImageUrl = null;
      let identityCardUrl = null;

      if (supa.user?.id) {
        if (profileImage) {
          const compressedProfile = await compressImage(profileImage);
          const profileResult = await uploadProfileImage(compressedProfile, supa.user.id);
          if (profileResult.success) {
            profileImageUrl = profileResult.url;
          }
        }

        if (identityCardImage) {
          const identityResult = await uploadIdentityCardImage(identityCardImage, supa.user.id);
          if (identityResult.success) {
            identityCardUrl = identityResult.url;
          }
        }
      }
      // Attempt to persist profile fields immediately if we have a session
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id || supa.user?.id;
        if (uid) {
          const updateData: any = {
            full_name: registrationData.full_name,
            phone: registrationData.phone,
            country: registrationData.country,
            city: registrationData.city,
            address: registrationData.address,
            affiliate_code: affiliateCode,
            ...(referrerAffCode ? { referrer_affiliate_code: referrerAffCode } : {}),
            updated_at: new Date().toISOString(),
          };

          if (profileImageUrl) {
            updateData.profile_image_url = profileImageUrl;
          }
          if (identityCardUrl) {
            updateData.identity_card_image_url = identityCardUrl;
          }

          console.log('Updating profile with data:', updateData);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', uid);
            
          if (updateError) {
            console.error('Profile update error:', updateError);
            // Try upsert instead
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({ id: uid, ...updateData });
            
            if (upsertError) {
              console.error('Profile upsert error:', upsertError);
            } else {
              console.log('Profile upserted successfully');
            }
          } else {
            console.log('Profile updated successfully');
          }

          // Create physical card request if requested
          if (registrationData.physical_card_requested) {
            await supabase
              .from('physical_card_requests')
              .insert({
                user_id: uid,
                full_name: registrationData.full_name,
                phone: registrationData.phone,
                address: registrationData.address,
                city: registrationData.city,
                country: registrationData.country,
                membership_tier: 'essential', // Default tier
                status: 'pending_payment', // Waiting for membership payment
                payment_amount: 0, // Physical card is free
                delivery_address: registrationData.address,
                delivery_city: registrationData.city,
                delivery_country: registrationData.country,
                ...(referrerAffCode ? { affiliate_code: referrerAffCode } : {}),
              });
          }
        }
      } catch (e) {
        console.error('Error updating profile:', e);
        // non-blocking
      }
      return supa;
    },
    onSuccess: (_data) => {
      console.log("🎉 Registration completed successfully!");
      // Welcome notifications: Supabase will send email confirmation if configured.
      toast.success("Account created! Please complete your membership card purchase to activate your account.");
      // Navigate to membership selection for mandatory card purchase
      navigate("/client-payment?new=true");
    },
    onError: (error: any) => {
      console.error("❌ Registration error:", error);
      toast.error(error.message || "Registration failed");
    },
  });
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Redirect logic
  if (shouldRedirectToDashboard) {
    navigate("/dashboard");
    return null;
  }

  if (shouldRedirectToPayment) {
    navigate("/client-payment");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <PremiumBanner
        title="Join Elverra Global"
        description="Become a client and unlock exclusive discounts, services, and opportunities across our network of partners"
        backgroundImage="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

    <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('register.title')}
              </h1>
              <p className="text-gray-600">
                {t('register.subtitle')}
              </p>
            </div>

            <CardContent className="p-8 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">
                      {t('form.name')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      required
                      placeholder={t('register.name.placeholder')}
                      data-testid="input-full-name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">
                      {t('register.email.optional')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={t('register.email.placeholder')}
                      data-testid="input-email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">
                    {t('form.phone')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    required
                    placeholder={t('register.phone.placeholder')}
                    data-testid="input-phone"
                    autoComplete="tel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t('register.city')}</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder={t('register.city.placeholder')}
                      data-testid="input-city"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t('register.address')}</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder={t('register.address.placeholder')}
                      data-testid="input-address"
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">{t('register.country')}</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                  >
                    <SelectTrigger data-testid="select-country">
                      <SelectValue placeholder={t('register.country.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Burkina Faso">
                        Burkina Faso
                      </SelectItem>
                      <SelectItem value="Ivory Coast">
                        Côte d'Ivoire
                      </SelectItem>
                      <SelectItem value="Ghana">Ghana</SelectItem>
                      <SelectItem value="Senegal">Sénégal</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">{t('form.password')} <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                        placeholder={t('register.password.placeholder')}
                        data-testid="input-password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        {t('register.password.confirm')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        required
                        placeholder={t('register.password.confirm.placeholder')}
                        data-testid="input-confirm-password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                {/* Image Uploads */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('register.images.title')}</h3>
                    
                    {/* Profile Image */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {t('register.profile.photo')}
                      </Label>
                      <div className="mt-2">
                        {profileImagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={profileImagePreview}
                              alt="Profile preview"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProfileImage(null);
                                setProfileImagePreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-full cursor-pointer hover:bg-gray-50">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setProfileImage(file);
                                  const reader = new FileReader();
                                  reader.onload = (e) => setProfileImagePreview(e.target?.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('register.profile.format')}
                      </p>
                    </div>

                    {/* Identity Card */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('register.identity.card')}
                      </Label>
                      <div className="mt-2">
                        {identityCardPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={identityCardPreview}
                              alt="Identity card preview"
                              className="w-32 h-20 object-cover border-2 border-gray-200 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIdentityCardImage(null);
                                setIdentityCardPreview(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-32 h-20 border-2 border-gray-300 border-dashed rounded cursor-pointer hover:bg-gray-50">
                            <Upload className="h-6 w-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/jpg,image/png,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIdentityCardImage(file);
                                  if (file.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => setIdentityCardPreview(e.target?.result as string);
                                    reader.readAsDataURL(file);
                                  } else {
                                    setIdentityCardPreview('/placeholder-pdf.png');
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('register.identity.format')}
                      </p>
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <Label htmlFor="referral_code">
                      {t('register.referral.code')}
                    </Label>
                    <Input
                      id="referral_code"
                      value={formData.referral_code}
                      onChange={(e) => {
                        if (!isReferralLocked) {
                          handleInputChange("referral_code", e.target.value);
                        }
                      }}
                      placeholder={t('register.referral.placeholder')}
                      data-testid="input-referral-code"
                      autoComplete="off"
                      disabled={isReferralLocked}
                      className={isReferralLocked ? "bg-gray-100" : ""}
                    />
                    {isReferralLocked && (
                      <p className="text-xs text-blue-600 mt-1">
                        {t('register.referral.locked')}
                      </p>
                    )}
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="physical_card_requested"
                        checked={formData.physical_card_requested}
                        onCheckedChange={(checked) =>
                          handleInputChange("physical_card_requested", checked)
                        }
                        data-testid="checkbox-physical-card"
                      />
                      <div>
                        <Label htmlFor="physical_card_requested" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {t('register.physical.card')}
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('register.physical.description')}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-medium"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>{t('register.button.creating')}</span>
                      </div>
                    ) : (
                      t('register.button.create')
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600">
                      {t('register.login.text')}{" "}
                      <Link
                        to="/login"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                        data-testid="link-login"
                      >
                        {t('register.login.link')}
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
