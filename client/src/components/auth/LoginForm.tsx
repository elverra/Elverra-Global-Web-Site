import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockIcon, KeyIcon, Mail, Phone, User } from "lucide-react";
import OTPVerification from "./OTPVerification";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Button as ToastButton } from "@/components/ui/button";

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, isAdmin } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResendConfirmationEmail = async (email: string) => {
    try {
      // TODO: Replace with API call to server - resend confirmation email
      const { error } = { error: null }; // Placeholder for migration

      if (error) {
        toast({
          title: "Failed to resend email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Confirmation email sent",
          description: `A new confirmation email has been sent to ${email}`,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailOrPhone || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email/phone and password.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);

    try {
      // Try to sign in with email/password using our auth system
      const { data, error } = await signIn(emailOrPhone, password);

      if (error) {
        console.error("Login error:", error);

        if (error && error.includes("Email not confirmed")) {
          toast({
            title: "Email not confirmed",
            description:
              "Please check your email and click the confirmation link. You can also request a new confirmation email.",
            variant: "destructive",
            action: (
              <ToastButton
                variant="outline"
                size="sm"
                onClick={() => handleResendConfirmationEmail(emailOrPhone)}
              >
                Resend Email
              </ToastButton>
            ),
          });
        } else {
          toast({
            title: "Login failed",
            description:
              error ||
              "Invalid credentials. Please check your email and password.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log("Login successful for user:", data.user.email);
        toast({
          title: "Login successful!",
          description: "Redirecting to your dashboard...",
        });

        // Wait a moment for role check to complete
        setTimeout(async () => {
          try {
            // Check if this is an admin user directly
            const isAdminUser =
              data.user.email === "admin@elverra.com" ||
              data.user.email === "madymadhu6@gmail.com";

            if (isAdminUser || isAdmin) {
              console.log(
                "Admin user detected, redirecting to admin dashboard",
              );
              navigate("/admin/dashboard");
            } else {
              // Check if user has membership
              try {
                const membershipResponse = await fetch(
                  `/api/memberships/${data.user.id}`,
                );
                const membershipData = membershipResponse.ok
                  ? await membershipResponse.json()
                  : null;

                if (membershipData && membershipData.isActive) {
                  console.log("Member user, redirecting to dashboard");
                  navigate("/dashboard");
                } else {
                  console.log(
                    "Non-member user, redirecting to membership payment",
                  );
                  navigate("/membership-payment");
                }
              } catch (membershipError) {
                console.log(
                  "No membership found, redirecting to membership payment",
                );
                navigate("/membership-payment");
              }
            }
          } catch (error) {
            console.error("Error during post-login redirect:", error);
            navigate("/dashboard"); // Default fallback
          }
        }, 500);

        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    // Send OTP to phone number
    setShowOTPVerification(true);

    // In a real app, this would make an API call to send an OTP code
    toast({
      title: "Verification code sent",
      description: `A verification code has been sent to ${phoneNumber}`,
    });
  };

  const handleOTPComplete = () => {
    // On successful OTP verification, log the user in
    toast({
      title: "Login successful!",
      description: "Welcome back to Club66.",
    });

    // Navigate to home page
    navigate("/");
  };

  const handleResendOTP = async () => {
    // In a real app, this would make an API call to resend an OTP code
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Verification code resent",
        description: `A new verification code has been sent to ${phoneNumber}`,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Log in to your account</CardTitle>
        <CardDescription>Access your Elverra client benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="credentials" className="w-full">
          

          <TabsContent value="credentials">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-phone">Email or Phone</Label>
                <Input
                  id="email-phone"
                  type="text"
                  placeholder="john@example.com or +223 XX XX XX XX"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            {showOTPVerification ? (
              <OTPVerification
                phoneNumber={phoneNumber}
                onVerifyComplete={handleOTPComplete}
                onResendCode={handleResendOTP}
              />
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+223 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                >
                  Send Verification Code
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  We'll send a verification code to your registered phone number
                </p>
              </form>
            )}
          </TabsContent>

          <TabsContent value="faceid">
            <div className="py-8 text-center space-y-4">
              <div className="bg-gray-100 w-32 h-32 rounded-full mx-auto flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-600">
                This feature requires the Elverra Mobile App
              </p>
              <Button className="bg-club66-purple hover:bg-club66-darkpurple">
                Download Our App
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="relative my-4 w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs"></div>
        </div>
        
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
