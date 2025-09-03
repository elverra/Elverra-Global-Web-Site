
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const SchoolFees = () => {
  const features = [
    "Emergency school fee coverage",
    "Quick approval process",    
    "No hidden charges",
    "24/7 support available"
  ];

  const howItWorks = [
    { step: 1, title: "Subscribe", description: "Join our School Fees emergency plan" },
    { step: 2, title: "Build Credits", description: "Accumulate tokens through monthly contributions" },
    { step: 3, title: "Emergency Request", description: "Submit request when you need assistance" },
    { step: 4, title: "Get Relief", description: "Receive immediate financial support" }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="School Fees Emergency Support"
        description="Your Safety Net, Always Ready! - Never let financial constraints interrupt your child's education"
        backgroundImage="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
        showBackButton
        backUrl="/services/o-secours"
      />

      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <School className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Emergency Relief at Your Fingertips!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Ensure your child's education never stops. Our School Fees emergency support provides 
                immediate financial assistance when you need it most.
              </p>
              <Badge className="text-lg px-6 py-2 bg-blue-500">Education Support</Badge>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                    <p className="font-medium">{feature}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* How It Works */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {howItWorks.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      {index < howItWorks.length - 1 && (
                        <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mt-4 hidden md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Be Prepared, Stay Secured with Ô Secour!</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of parents who trust us to protect their children's education
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Shield className="h-5 w-5 mr-2" />
                    Subscribe Now
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                    <Clock className="h-5 w-5 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchoolFees;
