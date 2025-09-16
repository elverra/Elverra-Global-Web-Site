import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AffiliateProgram = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      title: "10% Commission Rate",
      description:
        "Earn 10% commission on all membership fees paid by your referrals",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Recurring Income",
      description:
        "Earn monthly commissions as long as your referrals remain active",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "No Limits",
      description: "No cap on the number of referrals or earnings potential",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Manager Approval",
      description:
        "Codes activated only after proper orientation and manager sign-off",
      icon: Shield,
      color: "text-orange-600",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Sign Up",
      description:
        "Register for the affiliate program and get your unique code",
    },
    {
      step: 2,
      title: "Get Approved",
      description: "Complete orientation and wait for manager approval",
    },
    {
      step: 3,
      title: "Share Your Code",
      description: "Share your affiliate code with friends and family",
    },
    {
      step: 4,
      title: "Earn Commissions",
      description: "Receive 10% commission when they become members",
    },
  ];

  const tiers = [
    {
      name: "Bronze",
      referrals: "1-10",
      bonus: "0%",
      color: "border-amber-600",
    },
    {
      name: "Silver",
      referrals: "11-25",
      bonus: "2%",
      color: "border-gray-400",
    },
    {
      name: "Gold",
      referrals: "26-50",
      bonus: "5%",
      color: "border-yellow-500",
    },
    {
      name: "Platinum",
      referrals: "51-100",
      bonus: "8%",
      color: "border-purple-500",
    },
    {
      name: "Diamond",
      referrals: "100+",
      bonus: "12%",
      color: "border-blue-500",
    },
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Elverra Affiliate Program"
        description="Earn while you share the Elverra experience. Join thousands of affiliates earning recurring commissions across our network of markets."
        backgroundImage="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Program Benefits */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Join Our Affiliate Program?
              </h2>
              <p className="text-lg text-gray-600">
                Experience the benefits of being part of Africa's
                fastest-growing membership network
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <Icon
                        className={`h-12 w-12 ${benefit.color} mx-auto mb-4`}
                      />
                      <h3 className="text-lg font-semibold mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    <Card className="text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                          {step.step}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 text-purple-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Calculator */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-center">
                  Potential Earnings Calculator
                </CardTitle>
                <CardDescription className="text-center">
                  See how much you could earn with different client types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Essential Client
                    </h3>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      CFA 10,000/ans
                    </div>
                    <p className="text-sm text-gray-600">
                      Per referral (10% of CFA 1000)
                    </p>
                    <div className="mt-4 text-sm">
                      <div>
                        10 referrals = <strong>CFA 10,000/ans</strong>
                      </div>
                      <div>
                        50 referrals = <strong>CFA 50,000/ans</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 text-center border-2 border-purple-200">
                    <h3 className="text-lg font-semibold mb-2">
                      Premium Clients
                    </h3>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      CFA 10,000/ans
                    </div>
                    <p className="text-sm text-gray-600">
                      Per referral (10% of CFA 1000)
                    </p>
                    <div className="mt-4 text-sm">
                      <div>
                        10 referrals = <strong>CFA 10,000/ans</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Elite Clients
                    </h3>
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      CFA 10,000/ans
                    </div>
                    <p className="text-sm text-gray-600">
                      Per referral (10% of CFA 1000))
                    </p>
                    <div className="mt-4 text-sm">
                      <div>
                        7 referrals = <strong>CFA 7,000/ans</strong>
                      </div>
                      <div>
                        10 referrals = <strong>CFA 10,000/ans</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="bg-orange-50 border-orange-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Important Notice
                    </h3>
                    <p className="text-orange-700">
                      Your affiliate code will only become active after
                      completing our orientation program and receiving manager
                      approval. This ensures all our affiliates are properly
                      trained and equipped to represent Elverra Global
                      professionally.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of successful affiliates earning recurring
                  income with Elverra
                </p>
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => navigate("/dashboard")}
                >
                  Join Affiliate Program
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AffiliateProgram;
