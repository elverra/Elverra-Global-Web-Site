import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bike, Wrench, Shield, CheckCircle, ArrowRight } from "lucide-react";

const MotorbikesSupport = () => {
  const services = ["Emergency repair coverage", "24/7 helpline"];

  const emergencyTypes = [
  
    {
      title: "Accident Damage",
      description: "Repair costs from accidents and collisions",
    },
   
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Motorbike Emergency Support"
        description="Quick Relief, Zero Stress! - Keep your wheels rolling with our comprehensive motorbike emergency assistance"
        backgroundImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
        showBackButton
        backUrl="/services/o-secours"
      />

      <div className="py-16 bg-gradient-to-br from-orange-50 to-red-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bike className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Secour Got You Covered!
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Never worry about unexpected motorbike breakdowns again. Our
                emergency support gets you back on the road quickly and
                affordably.
              </p>
              <Badge className="text-lg px-6 py-2 bg-orange-500">
                Transportation Relief
              </Badge>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                    <p className="font-medium">{service}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Types */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  What We Cover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {emergencyTypes.map((type, index) => (
                    <div key={index} className="p-6 bg-orange-50 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-6 w-6 text-orange-500 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">{type.title}</h3>
                          <p className="text-gray-600 text-sm">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Get the Help You Need, When You Need It!
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Don't let a breakdown stop your journey. Join our motorbike
                  emergency support today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-orange-600 hover:bg-gray-100"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Get Protected
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

export default MotorbikesSupport;
