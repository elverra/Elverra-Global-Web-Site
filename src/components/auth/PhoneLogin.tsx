import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PhoneLoginProps {
  onLoginSuccess: (user: any, roles: any[]) => void;
  onSwitchToEmail: () => void;
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ onLoginSuccess, onSwitchToEmail }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtpSms, verifyOtpSms } = useAuth();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await sendOtpSms(phone.trim());
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('OTP sent via SMS');
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await verifyOtpSms(phone.trim(), otp.trim());
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Logged in successfully');
      onLoginSuccess({}, []);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  if (step === 'phone') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Phone Login</CardTitle>
          <CardDescription>
            Enter your phone number to receive an OTP
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+223 XX XX XX XX"
                required
                data-testid="input-phone-login"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the phone number you used to register
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
              data-testid="button-send-otp"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onSwitchToEmail}
                data-testid="button-switch-email"
              >
                Use Email & Password instead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {phone}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <Label htmlFor="otp">Verification Code *</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="text-center text-2xl tracking-wider font-bold"
              data-testid="input-otp"
            />
            <p className="text-sm text-gray-500 mt-1">
              Please check your phone for the verification code
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading || otp.length !== 6}
            data-testid="button-verify-otp"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOtp}
              disabled={isLoading}
              data-testid="button-resend-otp"
            >
              Resend OTP
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('phone')}
              data-testid="button-change-phone"
            >
              Change Phone Number
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhoneLogin;