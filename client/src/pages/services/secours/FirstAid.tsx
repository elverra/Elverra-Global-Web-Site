
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, Shield, CheckCircle, Phone } from 'lucide-react';

const FirstAid = () => {
  const services = [
    "24/7 emergency response",
    "Trained medical professionals",    
    "Medical consultation"    
  ];

  const emergencyTypes = [
    { title: "Medical Emergencies", description: "Heart attacks, strokes, and other life-threatening conditions" },
    { title: "Accident Response", description: "Immediate medical care for accident victims" },
    { title: "Allergic Reactions", description: "Emergency treatment for severe allergic reactions" },
    { title: "Trauma Care", description: "Professional trauma and injury assessment" }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="First Aid Emergency Support"
        description="Life's Unpredictable, Ô Secour's Not! - Professional medical emergency assistance when every second counts"
        backgroundImage="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
        showBackButton
        backUrl="/services/o-secours"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">Emergency Relief at Your Fingertips!</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                When medical emergencies strike, our trained professionals are ready to provide 
                immediate assistance. Your health and safety are our top priority.
              </p>
              <Badge className="text-lg px-6 py-2 bg-purple-500">Medical Emergency</Badge>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-purple-500 mx-auto mb-4" />
                    <p className="font-medium">{service}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Types */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Medical Emergencies We Handle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {emergencyTypes.map((type, index) => (
                    <div key={index} className="p-6 bg-purple-50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-6 w-6 text-purple-500 mt-1" />
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
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Your Health, Our Priority!</h2>
                <p className="text-xl mb-8 opacity-90">
                  Don't wait for an emergency to happen. Subscribe to our first aid service and have peace of mind.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="outline" className="bg-white text-purple-600 hover:bg-gray-100">
                    <Shield className="h-5 w-5 mr-2" />
                    Get Protected
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600">
                    <Phone className="h-5 w-5 mr-2" />
                    Emergency Hotline
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

export default FirstAid;
