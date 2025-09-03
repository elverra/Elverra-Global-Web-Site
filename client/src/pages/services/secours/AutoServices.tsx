
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Wrench, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const AutoServices = () => {
  const services = [
    "Emergency roadside assistance",
    "Towing services",
    "Battery replacement",
    "Tire repair and replacement"    
  ];

  const emergencyTypes = [
    { title: "Engine Breakdown", description: "Complete engine failure or overheating issues" },
    { title: "Flat Tire", description: "Emergency tire replacement and repair services" },
    { title: "Dead Battery", description: "Jump start and battery replacement services" },
    { title: "Lockout Service", description: "Professional lockout assistance for vehicles" }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Auto Services Emergency Support"
        description="Get the Help You Need, When You Need It! - Comprehensive automotive emergency assistance across Africa"
        backgroundImage="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
        showBackButton
        backUrl="/services/o-secours"
      />

      <div className="py-16 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Ô Secour: Your Partner in Times of Need!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Never get stranded on the road again. Our comprehensive auto emergency services 
                ensure you're always covered when vehicle problems arise.
              </p>
              <Badge className="text-lg px-6 py-2 bg-red-500">Vehicle Emergency</Badge>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="font-medium">{service}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Types */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-2xl text-center">What We Cover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {emergencyTypes.map((type, index) => (
                    <div key={index} className="p-6 bg-red-50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-6 w-6 text-red-500 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">{type.title}</h3>
                          <p className="text-gray-600 text-sm">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Never Get Stranded Again!</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join our auto emergency support and drive with confidence knowing help is always available.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                    <Shield className="h-5 w-5 mr-2" />
                    Get Coverage
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                    <AlertTriangle className="h-5 w-5 mr-2" />
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

export default AutoServices;
