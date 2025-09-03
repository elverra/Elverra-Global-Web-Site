import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import SecoursSubscriptions from "@/components/secours/SecoursSubscriptions";
import TokenPurchase from "@/components/secours/TokenPurchase";
import RescueRequest from "@/components/secours/RescueRequest";
import SecoursStats from "@/components/secours/SecoursStats";
import NotificationCenter from "@/components/secours/NotificationCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Coins,
  AlertTriangle,
  BarChart3,
  School,
  Bike,
  Phone,
  Car,
  Plus,
  ArrowRight,
  Star,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import { toast } from "sonner";

const OSecours = () => {
  const [activeTab, setActiveTab] = useState("services");
  const navigate = useNavigate();

  const secoursServices = [
    {
      id: "school",
      title: "School Fees",
      subtitle: "Education Support",
      caption: "Your Safety Net, Always Ready!",
      description:
        "Emergency financial support for school fees and educational expenses when you need it most.",
      image: "/lovable-uploads/e0b192e3-08ff-4a1a-b992-4e1316700df7.png",
      icon: School,
      color: "bg-blue-500",
      route: "/services/secours/school-fees",
    },
    {
      id: "motorbike",
      title: "Motorbikes",
      subtitle: "Transportation Relief",
      caption: "Quick Relief, Zero Stress!",
      description:
        "Emergency assistance for motorbike repairs, maintenance, and roadside support.",
      image: "/lovable-uploads/09b313a9-ea08-4b34-919c-23a479a101c2.png",
      icon: Bike,
      color: "bg-orange-500",
      route: "/services/secours/motorbikes",
    },
    {
      id: "phone",
      title: "Mobile Phones",
      subtitle: "Communication Support",
      caption: "Emergency Relief at Your Fingertips!",
      description:
        "Urgent support for phone repairs, replacement, and communication needs.",
      image: "/lovable-uploads/9094ce70-83db-4543-98a3-75637c3a6a2e.png",
      icon: Phone,
      color: "bg-green-500",
      route: "/services/secours/mobile-phones",
    },
    {
      id: "auto",
      title: "Auto Services",
      subtitle: "Vehicle Emergency",
      caption: "Get the Help You Need, When You Need It!",
      description:
        "Emergency roadside assistance, vehicle repair support, and automotive relief.",
      image: "/lovable-uploads/c2e4b64b-3780-4e20-a92b-84db52090e1c.png",
      icon: Car,
      color: "bg-red-500",
      route: "/services/secours/auto-services",
    },
    {
      id: "first-aid",
      title: "First Aid",
      subtitle: "Medical Emergency",
      caption: "Life's Unpredictable, Ô Secour's Not!",
      description:
        "Immediate medical assistance, first aid support, and health emergency relief.",
      image: "/lovable-uploads/4bc99b8b-f87c-4687-a2f1-ae0d6225e388.png",
      icon: Plus,
      color: "bg-purple-500",
      route: "/services/secours/first-aid",
    },
    
  ];

  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();

  const handleServiceClick = (service: any) => {
    if (!user) {
      toast.success(
        `${service.title} service details available. Sign up to subscribe!`,
      );
      navigate("/register");
      return;
    }

    // Allow users to view service details regardless of membership
    navigate(service.route);
  };

  const testimonials = [
    {
      name: "Marie Keita",
      location: "Bamako, Mali",
      service: "School Fees",
      text: "Ô Secour saved my daughter's education when I faced unexpected financial difficulties. Quick relief, zero stress indeed!",
    },
    {
      name: "Ibrahim Diallo",
      location: "Dakar, Senegal",
      service: "Motorbike Support",
      text: "My motorbike broke down during rainy season. Ô Secour got me back on the road within hours. Excellent service!",
    },
    {
      name: "Fatou Traore",
      location: "Abidjan, Ivory Coast",
      service: "Mobile Phone",
      text: "When my phone was stolen, Ô Secour provided emergency support immediately. They truly are your partner in times of need!",
    },
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Ô Secours - Emergency Assistance"
        description="Emergency Support, Simplified! Token-based subscription system for emergency bailout services. Be Prepared, Stay Secured with Ô Secour!"
        backgroundImage="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />

      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-6 mb-8">
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="subscriptions"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="tokens" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Buy Tokens
                </TabsTrigger>
                <TabsTrigger value="rescue" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Request Rescue
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  My Stats
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  My Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="services">
                <div className="mb-12 text-center">
                  <h2 className="text-4xl font-bold mb-6 text-gray-800">
                    Emergency Support, Simplified!
                  </h2>
                  <p className="text-2xl text-gray-600 mb-4">
                    Be Prepared, Stay Secured with Ô Secour!
                  </p>
                  <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
                    Life is full of unexpected challenges. Our comprehensive
                    emergency assistance program ensures you're never alone when
                    you need help the most. Choose from our specialized services
                    below.
                  </p>
                  <Badge
                    variant="outline"
                    className="text-lg px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-300"
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Trusted by 10,000+ Clients
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {secoursServices.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Card
                        key={service.id}
                        className="hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer group border-2 hover:border-purple-300"
                        onClick={() => handleServiceClick(service)}
                      >
                        <div className="relative">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <div
                              className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center shadow-lg`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-gray-800 shadow-md">
                              Emergency
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                              {service.title}
                            </CardTitle>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {service.subtitle}
                          </p>
                          <p className="text-lg font-semibold text-purple-600 italic">
                            "{service.caption}"
                          </p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-700 mb-6 leading-relaxed">
                            {service.description}
                          </p>
                          <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 group-hover:shadow-lg transition-all">
                            <Shield className="h-4 w-4 mr-2" />
                            Get Emergency Support
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Testimonials Section */}
                <div className="mb-16">
                  <h3 className="text-3xl font-bold text-center mb-12">
                    What Our Clients Say
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                      <Card
                        key={index}
                        className="bg-white shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-4 italic">
                            "{testimonial.text}"
                          </p>
                          <div className="border-t pt-4">
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-gray-500">
                              {testimonial.location}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {testimonial.service}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  <Card className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-10 relative z-10">
                      <Shield className="h-12 w-12 mb-4 opacity-90" />
                      <h3 className="text-2xl font-bold mb-4">
                        Ô Secour: Your Solution for a Brighter Tomorrow!
                      </h3>
                      <p className="text-lg opacity-90 mb-6 leading-relaxed">
                        Our token-based emergency assistance system ensures
                        you're never alone in times of need. Build your safety
                        net today and face tomorrow with confidence.
                      </p>
                      <Button
                        variant="outline"
                        className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                      >
                        Learn More About Our System
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    <CardContent className="p-10 relative z-10">
                      <AlertTriangle className="h-12 w-12 mb-4 opacity-90" />
                      <h3 className="text-2xl font-bold mb-4">
                        Secour Got You Covered!
                      </h3>
                      <p className="text-lg opacity-90 mb-6 leading-relaxed">
                        From medical emergencies to transportation breakdowns,
                        from educational needs to communication crises - we
                        provide instant relief when you need it most.
                      </p>
                      <Button
                        variant="outline"
                        className="bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                      >
                        Start Your Protection
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* How It Works Section */}
                <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-lg">
                  <CardContent className="p-12">
                    <h3 className="text-3xl font-bold text-center mb-8">
                      How Ô Secour Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            1
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Subscribe</h4>
                        <p className="text-gray-600 text-sm">
                          Choose your emergency service plan
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            2
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Build Tokens</h4>
                        <p className="text-gray-600 text-sm">
                          Accumulate emergency credits over time
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            3
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Emergency</h4>
                        <p className="text-gray-600 text-sm">
                          Request help when you need it
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-white">
                            4
                          </span>
                        </div>
                        <h4 className="font-semibold mb-2">Get Relief</h4>
                        <p className="text-gray-600 text-sm">
                          Receive immediate assistance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscriptions">
                <SecoursSubscriptions />
              </TabsContent>

              <TabsContent value="tokens">
                <TokenPurchase />
              </TabsContent>

              <TabsContent value="rescue">
                <RescueRequest />
              </TabsContent>

              <TabsContent value="stats">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <SecoursStats />
                  </div>
                  <div>
                    <NotificationCenter />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold">Account Management</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Access your complete Ô Secours account dashboard to manage
                    subscriptions, view transaction history, and track your
                    emergency assistance activity.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          My Account Dashboard
                        </CardTitle>
                        <CardDescription>
                          Complete overview of your Ô Secours activities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => navigate("/secours/my-account")}
                          className="w-full"
                        >
                          View My Account
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          Quick Actions
                        </CardTitle>
                        <CardDescription>
                          Fast access to common tasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setActiveTab("tokens")}
                        >
                          Buy Tokens
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setActiveTab("rescue")}
                        >
                          Request Rescue
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OSecours;
