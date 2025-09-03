
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PremiumMemberCard from '@/components/dashboard/PremiumMemberCard';
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ActivateCard = () => {
  const [activationCode, setActivationCode] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  
  // Mock member data - in real app, this would come from API
  const memberData = {
    memberName: "Ahmed Traore",
    memberID: "C66-ML-21058",
    expiryDate: "01/28",
    membershipTier: "Premium" as const,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    phoneNumber: "+223 XX XX XX XX",
    email: "ahmed.traore@example.com"
  };

  const handleActivation = () => {
    if (activationCode.length >= 6) {
      setIsActivated(true);
    }
  };

  return (
    <Layout>
      <PremiumBanner
        title="Activate Your Membership Card"
        description="Enter your activation code to unlock your premium Elverra Global client benefits."
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {!isActivated ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Activation</CardTitle>
                      <CardDescription>
                        Enter the activation code sent to your email or phone number to activate your membership card.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="activation-code">Activation Code</Label>
                        <Input
                          id="activation-code"
                          type="text"
                          placeholder="Enter your 6-digit code"
                          value={activationCode}
                          onChange={(e) => setActivationCode(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      <Button 
                        onClick={handleActivation}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        disabled={activationCode.length < 6}
                      >
                        Activate Card
                      </Button>
                      
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                          Didn't receive your code?{' '}
                          <Button variant="link" className="p-0 h-auto text-purple-600">
                            Resend Code
                          </Button>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <div className="bg-gray-200 rounded-xl p-8 mb-4">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Card Preview</h3>
                    <p className="text-sm text-gray-500">
                      Your premium membership card will appear here after activation.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Card Activated!</h2>
                  <p className="text-gray-600">
                    Your Elverra membership card has been successfully activated.
                  </p>
                </div>

                <div className="mb-8">
                  <PremiumMemberCard {...memberData} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h4 className="font-medium mb-2">Instant Benefits</h4>
                      <p className="text-sm text-gray-600">
                        Start using your discounts immediately at partner locations.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h4 className="font-medium mb-2">QR Code Ready</h4>
                      <p className="text-sm text-gray-600">
                        Your QR code is ready for scanning at verification points.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h4 className="font-medium mb-2">Mobile Access</h4>
                      <p className="text-sm text-gray-600">
                        Download and share your card anytime, anywhere.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-x-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline">
                    Find Partners
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivateCard;
