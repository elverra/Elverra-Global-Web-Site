
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((method === 'email' && !email) || (method === 'phone' && !phone)) {
      toast({
        title: "Missing information",
        description: `Please enter your ${method === 'email' ? 'email address' : 'phone number'}.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would make an API call to send a reset link/code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResetSent(true);
      toast({
        title: "Reset instructions sent",
        description: method === 'email' 
          ? `Password reset instructions have been sent to ${email}.` 
          : `A verification code has been sent to ${phone}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset instructions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
                  {resetSent 
                    ? "We've sent you instructions to reset your password" 
                    : "Choose how you want to reset your password"}
                </CardDescription>
              </CardHeader>
              
              {!resetSent ? (
                <CardContent>
                  <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setMethod(value as 'email' | 'phone')}>
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </TabsTrigger>
                      <TabsTrigger value="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="email">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            We'll send a password reset link to this email address.
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="phone">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+223 XX XX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                          <p className="text-xs text-gray-500">
                            We'll send a verification code to this phone number.
                          </p>
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Sending..." : "Send Verification Code"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
                    <p>
                      {method === 'email' 
                        ? `We've sent a password reset link to ${email}. Please check your email.` 
                        : `We've sent a verification code to ${phone}. Please check your messages.`}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      {method === 'email'
                        ? "Didn't receive the email? Check your spam folder."
                        : "Didn't receive the code?"}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setResetSent(false)}
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              )}
              
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

export default ForgotPassword;
