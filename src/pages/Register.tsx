import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { supabase } from "@/lib/supabaseClient";

// Fonction utilitaire pour récupérer l'ID utilisateur à partir d'un code d'affiliation ou de référence
async function getUserIdByAffiliateCode(affiliateCode: string): Promise<string | null> {
  if (!affiliateCode) return null;
  
  console.log('🔍 Recherche du code de parrainage :', affiliateCode);
  
  try {
    // Essayer d'abord avec le code de référence
    const { data, error } = await supabase
      .from('affiliates')
      .select("*")
      .eq('affiliate_code', affiliateCode)
      // .or(`referral_code.eq.${affiliateCode},affiliate_code.eq.${affiliateCode}`)
      .maybeSingle();
      console.log("affilate result",data)
      
    if (error) {
      console.error('❌ Erreur lors de la recherche du code de parrainage:', error);
      return null;
    }
    
    if (!data) {
      console.log('ℹ️ Aucun utilisateur trouvé avec ce code de parrainage');
      return null;
    }
    
    console.log('✅ Utilisateur trouvé avec l\'ID:', data.user_id);
    console.log('   - Code de référence:', data.referral_affiliate_code);
    console.log('   - Code d\'affiliation:', data.affiliate_code);
    
    return data.user_id;
  } catch (error) {
    console.error('❌ Erreur inattendue dans getUserIdByAffiliateCode:', error);
    return null;
  }
}
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
import { uploadProfileImage, uploadIdentityCardImage, compressImage } from "@/utils/imageUpload";
import { generateAffiliateCode,} from "@/utils/cardUtils";
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
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [identityCardImage, setIdentityCardImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [identityCardPreview, setIdentityCardPreview] = useState<string | null>(null);
  const [isReferralLocked, setIsReferralLocked] = useState(false);

  // Removed unused membership tiers - will be replaced with Supabase data

  // Redirect logic now handled after Supabase signup
  const shouldRedirectToDashboard = false;
  const shouldRedirectToPayment = false;
// Après le signup et création du profil
async function handleReferral(userId: string, referralCode?: string) {
  if (!referralCode) return; // Pas de code, on sort

  try {
    // 1️⃣ Récupérer l'ID du parrain grâce au code
    const { data: referrerData, error: referrerError } = await supabase
      .from('affiliates')
      .select('user_id')
      .eq('affiliate_code', referralCode)
      .maybeSingle();
console.log("affiliate result",referrerData)
    if (referrerError) {
      console.error('Erreur récupération du parrain :', referrerError);
      return;
    }
    if (!referrerData) {
      console.log('Code de parrainage invalide');
      return;
    }

    const referrerId = referrerData.user_id;

    // 2️⃣ Vérifier si l'utilisateur n'a pas déjà été référé
    const { data: existingReferral } = await supabase
      .from('commissions')
      .select('*')
      .eq('referred_user_id', userId)
      .single();

    if (existingReferral) {
      console.log('Utilisateur déjà référé, aucune ligne créée');
      return;
    }

    // 3️⃣ Créer la ligne de commission
    const { data: newCommission, error: commissionError } = await supabase
      .from('commissions')
      .insert([{
        referrer_id: referrerId,
        referred_user_id: userId,
        amount: 0, // valeur initiale
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (commissionError) {
      console.error('Erreur création commission :', commissionError);
      return;
    } 

    console.log('✅ Ligne de commission créée:', newCommission);

  } catch (err) {
    console.error('Erreur inattendue dans handleReferral:', err);
  }
}

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

      // Récupérer l'ID du référent à partir du code d'affiliation
      let referredByUserId = null;
      if (data.referral_code) {
        console.log('🔍 Recherche du référent avec le code:', data.referral_code);
        referredByUserId = await getUserIdByAffiliateCode(data.referral_code);
        console.log('🔗 ID du référent trouvé:', referredByUserId);
      }

      // Préparer les données d'inscription
        const registrationData = {
          email: data.email.trim(),
          password: data.password,
          full_name: data.full_name.trim(),
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "Mali",
          referral_code: data.referral_code || "",
          referred_by: referredByUserId, // Ajout du champ referred_by
          physical_card_requested: data.physical_card_requested,
        };
      
      console.log('📝 Données d\'inscription complètes:', {
        ...registrationData,
        password: '***', // Ne pas logger le mot de passe
        referred_by: referredByUserId
      });

    

      // Use email or phone as auth identifier (email is optional)
      const authEmail = registrationData.email || `${registrationData.phone}@temp.elverra.ml`;
      
      // Supabase sign up
      const { data: supa, error } = await signUp(authEmail, registrationData.password, {
        full_name: registrationData.full_name,
        phone: registrationData.phone,
        referral_code: registrationData.referral_code,
        physical_card_requested: registrationData.physical_card_requested,
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
        console.log('Starting image uploads for user:', supa.user.id);
        
        if (profileImage) {
          console.log('Uploading profile image...');
          const compressedProfile = await compressImage(profileImage);
          const profileResult = await uploadProfileImage(compressedProfile, supa.user.id);
          console.log('Profile image upload result:', profileResult);
          if (profileResult.success) {
            profileImageUrl = profileResult.url;
            console.log('Profile image URL:', profileImageUrl);
          } else {
            console.error('Profile image upload failed:', profileResult.error);
          }
        }

        if (identityCardImage) {
          console.log('Uploading identity card image...');
          const identityResult = await uploadIdentityCardImage(identityCardImage, supa.user.id);
          console.log('Identity card upload result:', identityResult);
          if (identityResult.success) {
            identityCardUrl = identityResult.url;
            console.log('Identity card URL:', identityCardUrl);
          } else {
            console.error('Identity card upload failed:', identityResult.error);
          }
        }
      }
      // Attempt to persist profile fields immediately if we have a session
      console.log("1er start")
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id || supa.user?.id;
        if (uid) {
         

          // S'assurer que les champs requis ont des valeurs par défaut si vides
          const profileData = {
            id: uid,
            full_name: data.full_name || 'Nouvel utilisateur',
            phone: data.phone || '',
            country: data.country || '',
            city: data.city || '',
            profile_image_url: profileImageUrl || 'https://dsnzsgszqdjmugjdyvzv.supabase.co/storage/v1/object/public/profile-images/default-avatar.png',
            identity_card_image_url: identityCardUrl || '',
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            referrer_affiliate_code: data.referral_code || null,
            referred_by: referredByUserId || null,
            physical_card_requested: data.physical_card_requested || false,
            has_physical_card: false
          };
console.log("profiles data",profileData)

          console.log('starttttt to profiles')
          try {
            // Try to update existing profile first
            const { data:dataInsert ,error: InsertError } = await supabase
              .from('profiles')
              .insert([profileData]);
              await handleReferral(uid, data.referral_code);
              
          console.log('starttttt to profiles 2',dataInsert)
            
            // If update fails (likely because profile doesn't exist), create a new one
            if (InsertError) {  
              console.log("profilles error 1",InsertError)
              // Generate affiliate code for new user
              const affiliateCode = generateAffiliateCode();
              const newReferralCode = generateReferralCode();
              
              // Find referrer's user ID if referral code is provided
              let referrerId = null;
              if (data.referral_code) {
                const { data: referrerData } = await supabase
                  .from('profiles')
                  .select('id, affiliate_code')
                  .or(`referral_code.eq.${data.referral_code},affiliate_code.eq.${data.referral_code}`)
                  .single();
                
                if (referrerData) {
                  referrerId = referrerData.id;
                }
              }
              
              // Create the new profile with referrer info
              const profileToInsert = {
                ...profileData,
                affiliate_code: `ELV-${affiliateCode}`,
                referred_by_user_id: referredByUserId, // Utiliser referredByUserId de la fonction parente
                referrer_affiliate_code: data.referral_code || null,
                referral_code: newReferralCode,
                physical_card_status: 'not_requested',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              console.log('💾 Création du profil avec les données:', {
                ...profileToInsert,
                referred_by: referredByUserId
              });
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([profileToInsert]);
              
              if (insertError) {
                throw new Error('Failed to create profile: ' + insertError.message);
              }
              
              // Create commission entry if referrer was found
              if (referrerId) {
                try {
                  
                  const { error: commissionError } = await supabase
                    .from('commissions')
                    .insert([{
                      referrer_id: referrerId,
                      referred_user_id: uid,
                      amount: 0,
                      status: 'pending',
                      payment_id: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }]);
                    
                  if (commissionError) {
                    console.error('Erreur commission:', commissionError);
                  }
                } catch (commissionError) {
                  console.error('Error processing referral:', commissionError);
                  // Non-blocking error
                }
              }
            }
          } catch (error) {
            console.error('Error in profile creation/update:', error);
            throw error;
          }
          
      

          // Update physical card request status in profiles if requested
          if (registrationData.physical_card_requested) {
            const { error: cardRequestError } = await supabase
              .from('profiles')
              .update({
                physical_card_requested: true,
                physical_card_status: 'requested',
                physical_card_request_date: new Date().toISOString()
              })
              .eq('id', uid);
            
            if (cardRequestError) {
              console.error('Error updating physical card request:', cardRequestError);
            } else {
              console.log('Physical card request recorded in profile');
            }
          }
        }
      } catch (e) {
        console.error('Error updating profile:', e);
        // non-blocking
      }
      return supa;
    },
    onSuccess: (_data) => {
      
      toast.success("Account created! Please complete your client card purchase to activate your account.");
      // Navigate to membership selection for mandatory card purchase
      navigate("/client-payment?new=true");
    },
    onError: (error: any) => {
      console.error("❌ Registration error:", error);
      toast.error(error.message || "Registration failed");
    },
  });
  // Génère un code de parrainage unique
  const generateReferralCode = (): string => {
    const prefix = 'ELV';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
  };

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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = t('form.required');
    }
    
    if (!formData.phone.trim()) {
      errors.phone = t('form.required');
    } else if (!/^[0-9+\s-]{8,20}$/.test(formData.phone)) {
      errors.phone = t('form.phone.invalid');
    }
    
    if (!formData.city.trim()) {
      errors.city = t('form.required');
    }
    
    if (!formData.password) {
      errors.password = t('form.required');
    } else if (formData.password.length < 6) {
      errors.password = t('form.password.too_short');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('form.password.mismatch');
    }
    
    if (!profileImage) {
      errors.profileImage = t('form.required');
    }
    
    if (!identityCardImage) {
      errors.identityCardImage = t('form.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    
    

    if (!validateForm()) {
      toast.error(t('form.validation_error'));
      return;
    }
    
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image upload with validation
  const handleImageUpload = (file: File | undefined, setter: (file: File) => void, previewSetter: (preview: string) => void, fileType: 'profile' | 'identity') => {
    if (!file) return;
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorKey = fileType === 'profile' ? 'profileImage' : 'identityCardImage';
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: t('form.image.size_error')
      }));
      return;
    }
    
    // Check file type
    const validTypes = fileType === 'profile' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
    if (!validTypes.includes(file.type)) {
      const errorKey = fileType === 'profile' ? 'profileImage' : 'identityCardImage';
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: t('form.image.type_error')
      }));
      return;
    }
    
    // Clear any previous errors
    const errorKey = fileType === 'profile' ? 'profileImage' : 'identityCardImage';
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
    
    // Set the file and preview
    setter(file);
    if (fileType === 'profile') {
      const reader = new FileReader();
      reader.onload = (e) => previewSetter(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => previewSetter(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      previewSetter('/placeholder-pdf.png');
    }
  };

  return (
    <Layout>
      <PremiumBanner
        title="Register to Access Your Account"
        description="Create your account and start enjoying our services"
        backgroundImage="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('register.title')}
                  </h1>
                  <p className="text-gray-600">
                    {t('register.subtitle')}
                  </p>
                </div>

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
                        className={formErrors.full_name ? 'border-red-500' : ''}
                      />
                      {formErrors.full_name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">
                        {t('register.email.optional')}
                        {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                          <span className="text-red-500 ml-1">* {t('form.email.invalid')}</span>
                        )}
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
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">
                        {t('register.city')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                        placeholder={t('register.city.placeholder')}
                        data-testid="input-city"
                        autoComplete="address-level2"
                        className={formErrors.city ? 'border-red-500' : ''}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                      )}
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
                      <Label htmlFor="password">
                        {t('form.password')} <span className="text-red-500">*</span>
                      </Label>
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
                        className={formErrors.password ? 'border-red-500' : ''}
                      />
                      {formErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                      )}
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
                        className={formErrors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Image Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('register.images.title')}</h3>
                    
                    {/* Profile Image */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {t('register.profile.photo')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        <div className={`border-2 ${formErrors.profileImage ? 'border-red-500 rounded-full' : 'border-transparent'} inline-block`}>
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
                            <label className={`flex flex-col items-center justify-center w-24 h-24 border-2 ${formErrors.profileImage ? 'border-red-500' : 'border-gray-300 border-dashed'} rounded-full cursor-pointer hover:bg-gray-50`}>
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload</span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, setProfileImage, setProfileImagePreview, 'profile');
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className={`text-xs ${formErrors.profileImage ? 'text-red-500' : 'text-gray-500'} mt-1`}>
                            {formErrors.profileImage || t('register.profile.format')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Identity Card */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('register.identity.card')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        <div className={`border-2 ${formErrors.identityCardImage ? 'border-red-500 rounded' : 'border-transparent'} inline-block`}>
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
                            <label className={`flex flex-col items-center justify-center w-32 h-20 border-2 ${formErrors.identityCardImage ? 'border-red-500' : 'border-gray-300 border-dashed'} rounded cursor-pointer hover:bg-gray-50`}>
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload</span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, setIdentityCardImage, setIdentityCardPreview, 'identity');
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className={`text-xs ${formErrors.identityCardImage ? 'text-red-500' : 'text-gray-500'} mt-1`}>
                            {formErrors.identityCardImage || t('register.identity.format')}
                          </p>
                        </div>
                      </div>
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
