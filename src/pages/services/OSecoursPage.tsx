import { Shield, Clock, AlertTriangle, Users, CreditCard, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const OSecoursPage = () => {
  const services = [
    {
      name: 'Motors Support',
      icon: Shield,
      description: 'Emergency assistance for motorcycles and transportation',
      tokenValue: 250,
      coverage: 'CFA 7,500 - 15,000'
    },
    {
      name: 'Auto Services',
      icon: Shield,
      description: 'Complete automotive emergency assistance',
      tokenValue: 750,
      coverage: 'CFA 22,500 - 45,000'
    },
    {
      name: 'School Fees',
      icon: Shield,
      description: 'Educational emergency support for students',
      tokenValue: 500,
      coverage: 'CFA 15,000 - 30,000'
    },
    {
      name: 'Mobile Phones',
      icon: Shield,
      description: 'Communication device emergency assistance',
      tokenValue: 250,
      coverage: 'CFA 7,500 - 15,000'
    },
    {
      name: 'Cata-Catani',
      icon: Shield,
      description: 'Emergency support for urgent situations',
      tokenValue: 500,
      coverage: 'CFA 15,000 - 30,000'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Quick Response',
      description: '24/7 emergency support available when you need it most'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join millions of members supporting each other'
    },
    {
      icon: CreditCard,
      title: 'Token-Based System',
      description: 'Purchase tokens in advance for immediate assistance'
    },
    {
      icon: CheckCircle,
      title: 'Guaranteed Support',
      description: 'Verified assistance for qualified emergencies'
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Ô Secours - Emergency Assistance"
        description="Get immediate help when you need it most with our token-based emergency support system"
        backgroundImage="https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-red-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Emergency Assistance When You Need It</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Ô Secours provides immediate emergency assistance through our innovative token-based system. 
                Purchase tokens in advance and get guaranteed support for qualified emergencies.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </Card>
              ))}
            </div>

            {/* Services Section */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Available Emergency Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <service.icon className="h-6 w-6 text-red-600" />
                      </div>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Token Value:</span>
                          <Badge variant="outline">CFA {service.tokenValue}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Coverage:</span>
                          <span className="text-sm font-medium">{service.coverage}</span>
                        </div>
                      </div>
                      <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                        <Link to="/services/o-secours">
                          Learn More
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <Tabs defaultValue="how-it-works" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                </TabsList>
                
                <TabsContent value="how-it-works" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple 4-Step Process</CardTitle>
                      <CardDescription>
                        Get emergency assistance quickly and easily with our streamlined process
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-red-600">1</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Subscribe to Service</h3>
                            <p className="text-gray-600">
                              Choose the emergency service you need and subscribe to start building your token balance.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-red-600">2</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Purchase Tokens</h3>
                            <p className="text-gray-600">
                              Buy tokens in advance to ensure you have sufficient balance for emergency assistance.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-red-600">3</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Request Assistance</h3>
                            <p className="text-gray-600">
                              When an emergency occurs, submit a rescue request through your dashboard with details.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-red-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-red-600">4</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Get Support</h3>
                            <p className="text-gray-600">
                              Our team processes your request and provides the assistance based on your subscription type.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requirements" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility Requirements</CardTitle>
                      <CardDescription>
                        Make sure you meet these requirements to access emergency assistance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="font-bold mb-4">Basic Requirements</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Active Elverra Global client subscription</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Subscription to relevant Ô Secours service</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Sufficient token balance for assistance</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Valid identification documents</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-bold mb-4">Token Balance Requirements</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Minimum 30 tokens required</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Maximum 60 tokens per rescue request</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Tokens must be purchased in advance</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Emergency must be verified and approved</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <CardContent className="p-12">
                  <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-white" />
                  <h2 className="text-3xl font-bold mb-4">Don't Wait for an Emergency</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Subscribe to Ô Secours today and ensure you're prepared when life's unexpected moments happen
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="outline" className="bg-white text-red-600 hover:bg-gray-100">
                      <Link to="/services/o-secours" className="flex items-center">
                        Start Subscription
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-red-600">
                      <Link to="/about/contact">
                        Learn More
                      </Link>
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

export default OSecoursPage;