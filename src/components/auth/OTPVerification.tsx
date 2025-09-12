
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";
import { Phone } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerifyComplete: () => void;
  onResendCode: () => Promise<void>;
}

const OTPVerification = ({ phoneNumber, onVerifyComplete, onResendCode }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter all 6 digits",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // In a real app, this would make an API call to verify the OTP
      // For now, we'll simulate a successful verification after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, any 6-digit code is considered valid
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });
      
      onVerifyComplete();
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    
    try {
      null;
      
      // Start the countdown timer (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive"
      });
      setResendDisabled(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-club66-purple/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-club66-purple" />
        </div>
        <h3 className="text-xl font-medium">Verify your phone number</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
      </div>
      
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSeparator />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <div className="space-y-3">
        <Button 
          onClick={handleVerifyOTP} 
          className="w-full bg-club66-purple hover:bg-club66-darkpurple"
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </Button>
        
        <p className="text-center text-sm">
          Didn't receive a code?{' '}
          <button
            onClick={handleResendCode}
            disabled={resendDisabled}
            className="text-club66-purple hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendDisabled ? `Resend code in ${countdown}s` : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
