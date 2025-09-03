
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import OTPVerification from '@/components/auth/OTPVerification';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: OTP verification, 2: New password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleVerifyComplete = () => {
    setStep(2);
  };

  const handleResendOTP = async () => {
    // In a real app, this would make an API call to resend the OTP code
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Verification code resent",
        description: "A new verification code has been sent to your phone.",
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please enter and confirm your new password.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      // In a real app, this would make an API call to reset the password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Password reset successful!",
        description: "Your password has been reset. You can now log in with your new password."
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "There was an error resetting your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Reset your password</CardTitle>
                <CardDescription>
                  {step === 1 
                    ? "Verify your identity to reset your password" 
                    : "Create a new password for your account"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {step === 1 ? (
                  <OTPVerification 
                    phoneNumber="+223 XX XX XX XX" // In a real app, this would come from the URL params or context
                    onVerifyComplete={handleVerifyComplete}
                    onResendCode={handleResendOTP}
                  />
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                      disabled={isResetting}
                    >
                      {isResetting ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <div className="text-sm text-center mt-4">
                  Remember your password?{' '}
                  <Link to="/login" className="text-club66-purple hover:underline">
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
