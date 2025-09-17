import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const MembershipPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string, isChild: boolean = false) => {
    if (user) {
      // User is logged in, go to client subscription page
      if (isChild) {
        navigate(`/client-subscription?preselect=child`);
      } else {
        navigate(`/client-subscription?preselect=adult&tier=${planName.toLowerCase()}`);
      }
    } else {
      // User not logged in, redirect to register with plan info
      navigate(`/register?plan=${planName.toLowerCase()}`);
    }
  };

  const plans = [
    {
      name: "Kiddies Card",
      price: "5,000",
      monthly: "500",
      discount: "100%",
      color: "bg-pink-100",
      textColor: "text-pink-900",
      buttonVariant: "outline",
      isChild: true,
      features: [
        "Réductions de 10% dans les magasins de jouets",
        "Accès prioritaire aux événements familiaux",
        "Programmes éducatifs complets",
        "Assistance parentale 24/7",
        "Carte physique personnalisée incluse",
        "Activités exclusives enfants",
        "Support communautaire",
      ],
    },
    {
      name: "Essential",
      price: "10,000",
      monthly: "1,000",
      discount: "5%",
      color: "bg-gray-100",
      textColor: "text-gray-900",
      buttonVariant: "outline",
      features: [
        "5% discount at Elverra businesses",
        "Digital Value Card",
        "Access to partner discounts",
        "Client community access",
        "Access to job center",
        "Payday loans (8% flat interest)",
      ],
    },
    {
      name: "Premium",
      price: "10,000",
      monthly: "2,000",
      discount: "10%",
      color: "gold-gradient",
      textColor: "text-gray-900",
      buttonVariant: "secondary",
      popular: true,
      features: [
        "10% discount at Elverra businesses",
        "Digital Value Card",
        "Access to partner discounts",
        "Client community access",
        "Access to job center",
        "Payday loans (8% flat interest)",
        "Priority customer support",
        "Exclusive event invitations",
      ],
    },
    {
      name: "Elite",
      price: "10,000",
      monthly: "5,000",
      discount: "20%",
      color: "card-gradient",
      textColor: "text-white",
      buttonVariant: "default",
      features: [
        "20% discount at Elverra businesses",
        "Digital Value Card",
        "Access to partner discounts",
        "Client community access",
        "Access to job center",
        "Payday loans (5% flat interest)",
        "Priority customer support",
        "Exclusive event invitations",
        "Free business training",
        "Investment opportunities",
      ],
    },
  ];

  return (
    <section className="py-16 bg-white" id="plans">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Find the Perfect Client Plan
          </h2>
          <p className="text-gray-600">
            Choose a plan that fits your lifestyle and goals. All plans include
            access to our exclusive network of partner businesses and special
            client-only benefits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border ${plan.popular ? "shadow-lg ring-2 ring-club66-gold" : "shadow"} relative animate-slide-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 py-1 text-center bg-club66-gold text-white text-sm font-medium rounded-full bg-purple-600">
                  Most Popular
                </div>
              )}
              <CardHeader
                className={`${plan.color} rounded-t-lg ${plan.textColor}`}
              >
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription
                  className={
                    plan.name === "Elite" ? "text-gray-100" : "text-gray-700"
                  }
                >
                  {plan.discount} discount on all Elverra services
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500">Annual Fee</p>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold">CFA {plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    + CFA {plan.monthly} monthly
                  </p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan.name, plan.isChild)}
                  className={`w-full ${plan.buttonVariant === "default" ? "bg-purple-600 hover:bg-purple-700" : plan.isChild ? "bg-pink-600 hover:bg-pink-700 text-white" : ""}`}
                  variant={
                    plan.buttonVariant === "default"
                      ? "default"
                      : plan.buttonVariant === "secondary"
                        ? "secondary"
                        : "outline"
                  }
                >
                  Select {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            All clients plans include the option to select additional social
            benefits
          </p>
          <Button variant="link" className="text-purple-600">
            Learn more about social benefits
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MembershipPlans;
