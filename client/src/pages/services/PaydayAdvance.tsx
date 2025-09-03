
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, Clock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const PaydayAdvance = () => {
  const features = [
    {
      icon: Clock,
      title: 'Quick Processing',
      description: 'Get your advance within 24 hours of approval'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'All transactions are encrypted and secure'
    },
    {
      icon: CheckCircle,
      title: 'Easy Repayment',
      description: 'Flexible repayment options to suit your needs'
    }
  ];

  const requirements = [
    'Active Elverra Global Client',
    'Minimum 3 months Client history',
    'Valid government-issued ID',
    'Proof of income or employment',
    'Bank account for disbursement'
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Payday Advance"
        description="Quick cash advances for your immediate financial needs"
        backgroundImage="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />

      <div className="py-16 bg-gradient-to-br from-orange-50 to-yellow-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <PiggyBank className="h-12 w-12 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Quick Cash When You Need It</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get immediate financial assistance with our payday advance service. 
                Perfect for unexpected expenses or emergencies.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Icon className="h-8 w-8 text-orange-600" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Application Requirements */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                  Application Requirements
                </CardTitle>
                <CardDescription>
                  To qualify for a payday advance, you'll need:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center">
                      <Badge variant="outline" className="mr-3 bg-green-50 text-green-700">
                        ✓
                      </Badge>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-6 w-6 mr-2 text-blue-600" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Advance Limits</h4>
                  <p className="text-gray-600 text-sm">
                    • Minimum advance: 25,000 CFA<br />
                    • Maximum advance: 500,000 CFA (based on client tier)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Repayment Terms</h4>
                  <p className="text-gray-600 text-sm">
                    • Repayment period: 15-30 days<br />
                    • Service fee: 5-10% of advance amount<br />
                    • No hidden charges or penalties for early repayment
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Processing Time</h4>
                  <p className="text-gray-600 text-sm">
                    • Application review: 2-4 hours<br />
                    • Fund disbursement: Within 24 hours of approval
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Apply?</h3>
                  <p className="text-lg mb-6 opacity-90">
                    Get the cash you need today with our quick and secure payday advance service.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                      Apply Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-black hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaydayAdvance;
