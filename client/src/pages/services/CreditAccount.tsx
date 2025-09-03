
import { CreditCard, ShieldCheck, Clock, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CreditAccount = () => {
  const features = [
    {
      icon: CreditCard,
      title: "Flexible Credit Limit",
      description: "Credit limits tailored to your membership tier and financial history."
    },
    {
      icon: Clock,
      title: "Convenient Repayment",
      description: "Multiple repayment options including mobile money and bank transfers."
    },
    {
      icon: ShieldCheck,
      title: "Secure Transactions",
      description: "End-to-end encryption for all credit account activities."
    }
  ];
  
  const membershipTiers = [
    {
      tier: "Essential",
      creditLimit: "Up to CFA 50,000",
      interestRate: "10% per month",
      processingTime: "48 hours"
    },
    {
      tier: "Premium",
      creditLimit: "Up to CFA 150,000",
      interestRate: "8% per month",
      processingTime: "24 hours"
    },
    {
      tier: "Elite",
      creditLimit: "Up to CFA 300,000",
      interestRate: "6% per month",
      processingTime: "12 hours"
    }
  ];
  
  return (
    <Layout>
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Credit Account</h1>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Shop now, pay later with the Club66 Global Credit Account. Access flexible credit options 
            for purchases at our partner merchants with competitive rates based on your membership tier.
          </p>
          
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-6">Financial Freedom at Your Fingertips</h2>
                <p className="text-gray-600 mb-6">
                  The Elverra Global Credit Account provides members with a flexible way to make purchases at 
                  our partner merchants and pay over time. Whether you're buying essential items, electronics, 
                  or services, our credit account offers competitive rates and convenient repayment options.
                </p>
                
                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-club66-purple/10 p-2 rounded-full mr-4 shrink-0">
                        <feature.icon className="h-5 w-5 text-club66-purple" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="bg-club66-purple hover:bg-club66-darkpurple">
                  Apply for Credit Account
                </Button>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Credit Account Benefits by Membership Tier</h3>
                <div className="space-y-6">
                  {membershipTiers.map((tier, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-3">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          tier.tier === "Elite" ? "bg-club66-purple" : 
                          tier.tier === "Premium" ? "bg-amber-500" : "bg-gray-500"
                        }`}></div>
                        <h4 className="font-bold">{tier.tier} Membership</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-gray-600">Credit Limit:</span>
                        <span className="font-medium">{tier.creditLimit}</span>
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{tier.interestRate}</span>
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-medium">{tier.processingTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <span className="font-bold text-club66-purple">1</span>
                  </div>
                  <CardTitle>Apply Online</CardTitle>
                  <CardDescription>
                    Complete the credit application through your member dashboard or our mobile app.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Provide your personal information, employment details, and preferred credit limit. 
                    Your membership tier will automatically be considered for credit terms.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <span className="font-bold text-club66-purple">2</span>
                  </div>
                  <CardTitle>Quick Approval</CardTitle>
                  <CardDescription>
                    Receive a decision based on your membership tier and financial information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Elite members enjoy the fastest approval times, often within hours. 
                    Credit decisions are made using our secure verification system.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <span className="font-bold text-club66-purple">3</span>
                  </div>
                  <CardTitle>Shop & Repay</CardTitle>
                  <CardDescription>
                    Use your credit at partner merchants and repay according to your terms.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Your credit is linked to your membership card for easy access. 
                    Repay through mobile money, bank transfer, or in-person at our offices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Eligibility Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold mb-4">Basic Requirements</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Active Club66 Global membership</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Valid identification (National ID or Passport)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Proof of residence (utility bill or lease)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Active mobile money account or bank account</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-4">Additional Benefits</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>No collateral required</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Flexible repayment options (1-3 months)</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Credit limit increases with good repayment history</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>Quick reapplication for repeat customers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 border-t">
                <h3 className="font-bold mb-4">Credit Account FAQs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Can I increase my credit limit?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Yes, credit limits can be increased based on your payment history and membership tier. 
                      Elite members are eligible for the highest credit limits.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">What happens if I miss a payment?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Late payments incur additional fees and may affect your ability to access credit in the future. 
                      Contact customer support immediately if you anticipate payment difficulties.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Can I use my credit account at any business?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      The credit account can be used at Elverra Global businesses and select partner merchants. 
                      A complete list of participating businesses is available in your member dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-gray-600 mb-8">
              Access your credit account through your Elverra Global membership and enjoy flexible 
              shopping at our partner merchants. Apply today and get a decision quickly.
            </p>
            <Button className="bg-club66-purple hover:bg-club66-darkpurple" size="lg">
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreditAccount;
