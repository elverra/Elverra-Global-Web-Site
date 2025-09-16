
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Smartphone, Shield, CheckCircle, Zap, Link } from 'lucide-react';

const MobilePhones = () => {
  const services = [
    "Screen repair & replacement",
    "Water damage recovery",
    "Battery replacement",
    "Software troubleshooting",
    "Emergency phone rental"
  ];

  const urgentSituations = [
    "Cracked or shattered screen",
    "Water damage incidents",
    "Battery completely dead",
    "Phone won't turn on",
    "Lost or stolen device"
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Mobile Phone Emergency Support"
        description="Emergency Relief at Your Fingertips! - Stay connected with our comprehensive mobile phone assistance"
        backgroundImage="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
        showBackButton
        backUrl="/services/o-secours"
      />

      <div className="py-16 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Life's Unpredictable, Ô Secour's Not!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Keep your communication lifeline active. Our mobile phone emergency support 
                ensures you're never disconnected from what matters most.
              </p>
              <Badge className="text-lg px-6 py-2 bg-green-500">Communication Support</Badge>
            </div>

            {/* Services Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <Smartphone className="h-8 w-8 text-green-500 mx-auto mb-4" />
                    <p className="font-medium">{service}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Situations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-green-500" />
                    Urgent Situations We Handle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {urgentSituations.map((situation, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{situation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle>Why Choose Our Service?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Fast Response</h4>
                        <p className="text-sm text-gray-600">Emergency support within 2 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Quality Parts</h4>
                        <p className="text-sm text-gray-600">Only genuine replacement components</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium">Data Security</h4>
                        <p className="text-sm text-gray-600">Your personal data stays protected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ô Secour: Your Partner in Times of Need!</h2>
                <p className="text-xl mb-8 opacity-90">
                  Don't let a broken phone break your connections. Stay protected with our emergency service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                      <Phone className="h-5 w-5 mr-2" />
                      Subscribe Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-green-600">
                    <Shield className="h-5 w-5 mr-2" />
                    Emergency Help
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

export default MobilePhones;
