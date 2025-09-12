import { Percent, CreditCard, Users, Gift, Award, Clock } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: <Percent className="h-10 w-10 text-purple-600" />,
      title: "Exclusive Discounts",
      description:
        "Enjoy 5-20% discounts at thousands of partner businesses across our client network.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-purple-600" />,
      title: "Digital Value Card",
      description:
        "Access your client benefits with a secure Zenika Card featuring QR verification.",
    },
    {
      icon: <Users className="h-10 w-10 text-purple-600" />,
      title: "Professional Network",
      description:
        "Connect with millions of clients and expand your professional network across our client network.",
    },
    {
      icon: <Gift className="h-10 w-10 text-purple-600" />,
      title: "Social Benefits",
      description:
        "Choose from benefits like startup capital, payday loans, land plots, and more.",
    },
    {
      icon: <Award className="h-10 w-10 text-purple-600" />,
      title: "Job Opportunities",
      description:
        "Get priority access to job opportunities through our dedicated job center portal.",
    },
    {
      icon: <Clock className="h-10 w-10 text-purple-600" />,
      title: "Flexible Payment Options",
      description:
        "Pay via mobile money, bank transfers, or credit cards with instant confirmation.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Client Benefits</h2>
          <p className="text-gray-600">
            Discover the advantages of being an Elverra Global client and how
            our services can enhance your lifestyle, career, and financial
            wellbeing across our client network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
