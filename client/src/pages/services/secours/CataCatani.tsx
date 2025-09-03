
  import Layout from '@/components/layout/Layout';
  import PremiumBanner from '@/components/layout/PremiumBanner';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { Truck, MapPin, Shield, CheckCircle, Clock } from 'lucide-react';

  const CataCatani = () => {
    const services = [
      "Emergency transport services",
      "Logistics coordination",
      "Inter-city travel assistance",
      "Freight emergency support",
      "Route planning assistance"
    ];

    const transportTypes = [
      { title: "Emergency Transport", description: "Urgent transportation when regular services are unavailable" },
      { title: "Logistics Support", description: "Emergency freight and cargo transportation" },
      { title: "Travel Assistance", description: "Help with stranded travelers and emergency bookings" },
      { title: "Route Planning", description: "Alternative route planning during emergencies" }
    ];

    return (
      <Layout>
        <PremiumBanner
          title="Cata-Catani Transportation Support"
          description="Ô Secour: Your Partner in Times of Need! - Comprehensive transportation and logistics emergency assistance"
          backgroundImage="https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          variant="compact"
          showBackButton
          backUrl="/services/o-secours"
        />

        <div className="py-16 bg-gradient-to-br from-yellow-50 to-amber-100 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Be Prepared, Stay Secured with Ô Secour!</h2>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  When transportation challenges arise, our Cata-Catani service ensures you're never 
                  stranded. From emergency transport to logistics support, we've got you covered.
                </p>
                <Badge className="text-lg px-6 py-2 bg-yellow-500">Transportation Hub</Badge>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {services.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                      <p className="font-medium">{service}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Transport Types */}
              <Card className="mb-16">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Transportation Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {transportTypes.map((type, index) => (
                      <div key={index} className="p-6 bg-yellow-50 rounded-lg">
                        <div className="flex items-start space-x-4">
                          <CheckCircle className="h-6 w-6 text-yellow-500 mt-1" />
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
              <Card className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                <CardContent className="p-12 text-center">
                  <h2 className="text-3xl font-bold mb-4">Never Get Stranded Again!</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Subscribe to our Cata-Catani service and enjoy peace of mind with our comprehensive transportation support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="outline" className="bg-white text-yellow-600 hover:bg-gray-100">
                      <Shield className="h-5 w-5 mr-2" />
                      Get Coverage
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-yellow-600">
                      <Clock className="h-5 w-5 mr-2" />
                      24/7 Support
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

  export default CataCatani;
