import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import LoginForm from "@/components/auth/LoginForm";
import PhoneLogin from "@/components/auth/PhoneLogin";
import { Link, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const { membership, loading: membershipLoading } = useMembership();

  // Show loading spinner while checking authentication
  if (loading || membershipLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  // If user is logged in, redirect appropriately
  if (user) {
    const isAdminUser = user.email === 'admin@elverra.com' || user.email === 'oladokunefi123@gmail.com';
    
    // Admin users go directly to admin panel
    if (isAdminUser) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // If user has active membership, go to dashboard
    if (membership && membership.is_active) {
      return <Navigate to="/dashboard" replace />;
    }
    // If user is logged in but no active membership, redirect to payment page
    return <Navigate to="/membership-payment" replace />;
  }

  return (
    <Layout>
      <PremiumBanner
        title="Welcome Back"
        description="Sign in to access your Elverra client benefits and exclusive features."
        backgroundImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Login illustration"
                className="rounded-lg shadow-xl w-full h-96 object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to access your Elverra client benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email" data-testid="tab-email-login">Email & Password</TabsTrigger>
                      <TabsTrigger value="phone" data-testid="tab-phone-login">Phone & OTP</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email" className="space-y-4 mt-6">
                      <LoginForm />
                    </TabsContent>
                    
                    <TabsContent value="phone" className="space-y-4 mt-6">
                      <PhoneLogin
                        onLoginSuccess={(user, roles) => {
                          // Handle successful phone login
                          window.location.reload(); // This will trigger the auth hooks to update
                        }}
                        onSwitchToEmail={() => {
                          // Switch to email tab - handled by parent
                          const emailTab = document.querySelector('[value="email"]') as HTMLElement;
                          emailTab?.click();
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center">
                    <Link
                      to="/forgot-password"
                      className="text-purple-600 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="text-sm text-center">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-purple-600 hover:underline"
                    >
                      Join Elverra now
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
