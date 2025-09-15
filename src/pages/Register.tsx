import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const { signUp } = useAuth();
  const { user } = useAuth();

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

      // Email is optional; phone, country, city are required
      if (!data.phone.trim()) {
        throw new Error("Phone number is required");
      }
      if (!data.country.trim()) {
        throw new Error("Country is required");
      }
      if (!data.city.trim()) {
        throw new Error("City is required");
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

      // Supabase sign up
      const { data: supa, error } = await signUp(registrationData.email, registrationData.password, {
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
      // Attempt to persist profile fields immediately if we have a session
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (uid) {
          await supabase
            .from('profiles')
            .update({
              full_name: registrationData.full_name,
              phone: registrationData.phone,
              country: registrationData.country,
              city: registrationData.city,
            })
            .eq('id', uid);
        }
      } catch (e) {
        // non-blocking
      }
      return supa;
    },
    onSuccess: (_data) => {
      console.log("🎉 Registration completed successfully!");
      // Welcome notifications: Supabase will send email confirmation if configured.
      toast.success("Account created! Please complete your membership card purchase to activate your account.");
      // Navigate to membership selection for mandatory card purchase
      navigate("/client-subscription?new=true");
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
    navigate("/client-subscription");
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
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Join thousands of clients enjoying exclusive benefits
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) =>
                          handleInputChange("full_name", e.target.value)
                        }
                        required
                        placeholder="Enter your full name"
                        data-testid="input-full-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="your.email@example.com"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        required
                        placeholder="+223 XX XX XX XX"
                        data-testid="input-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                      >
                        <SelectTrigger data-testid="select-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mali">Mali</SelectItem>
                          <SelectItem value="Burkina Faso">
                            Burkina Faso
                          </SelectItem>
                          <SelectItem value="Ivory Coast">
                            Ivory Coast
                          </SelectItem>
                          <SelectItem value="Ghana">Ghana</SelectItem>
                          <SelectItem value="Senegal">Senegal</SelectItem>
                          <SelectItem value="Niger">Niger</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        required
                        placeholder="Enter your city"
                        data-testid="input-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter your address"
                        data-testid="input-address"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                        placeholder="Minimum 6 characters"
                        data-testid="input-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm Password *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        required
                        placeholder="Repeat your password"
                        data-testid="input-confirm-password"
                      />
                    </div>
                  </div>

                  {/* Referral Code */}
                  <div>
                    <Label htmlFor="referral_code">
                      Referral Code (Optional)
                    </Label>
                    <Input
                      id="referral_code"
                      value={formData.referral_code}
                      onChange={(e) =>
                        handleInputChange("referral_code", e.target.value)
                      }
                      placeholder="Enter referral code if you have one"
                      data-testid="input-referral-code"
                    />
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-4">

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="physical_card_requested"
                        checked={formData.physical_card_requested}
                        onCheckedChange={(checked) =>
                          handleInputChange("physical_card_requested", checked === true)
                        }
                        data-testid="checkbox-physical-card"
                      />
                      <Label htmlFor="physical_card_requested" className="text-sm">
                        I want to receive a physical membership card
                      </Label>
                    </div>
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
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-purple-600 hover:text-purple-700 font-medium"
                        data-testid="link-login"
                      >
                        Sign in here
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
