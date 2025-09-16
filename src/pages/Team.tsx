import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Globe, Target, Users } from "lucide-react";

const Team = () => {
  const teamRoles = [
    {
      id: 1,
      position: "Executive Director - CEO",
      bio: "Providing strategic leadership and overseeing the overall operations and growth of the organization.",
    },
    {
      id: 2,
      position: "Executive Director - Deputy CEO",
      bio: "Supporting the CEO in managing operations and implementing the organization’s vision and goals.",
    },
    {
      id: 3,
      position: "Head of Department - Acting Head of Sales and Marketing",
      bio: "Driving sales strategies, marketing initiatives, and ensuring customer satisfaction.",
    },
    {
      id: 4,
      position:
        "Executive Director - Administration, Procurement and Facilities Management",
      bio: "Managing administrative services, procurement activities, and maintaining facilities efficiency.",
    },
    {
      id: 5,
      position: "Head of Department - Partnerships and Sponsorships",
      bio: "Building partnerships, securing sponsorships, and fostering relationships with external stakeholders.",
    },
    {
      id: 6,
      position: "Head of Department - Acting Head of Accounting",
      bio: "Overseeing financial reporting, accounting processes, and ensuring compliance with standards.",
    },
    {
      id: 7,
      position: "Head of Department - Human Resources",
      bio: "Managing talent acquisition, employee relations, training, and overall workforce development.",
    },
    {
      id: 8,
      position: "Head of Department - IT and Technology",
      bio: "Leading technology initiatives, ensuring IT infrastructure efficiency, and supporting digital transformation.",
    },
    {
      id: 9,
      position: "Head of Department - Communication and Compliance",
      bio: "Overseeing internal and external communication, while ensuring compliance with regulations and standards.",
    },
    {
      id: 10,
      position: "Head of Department - Legal",
      bio: "Providing legal guidance, ensuring regulatory compliance, and safeguarding the organization’s interests.",
    },
  ];

  const organizationRoles = [
    "CEO",
    "Deputy CEO",
    "Senior Department Managers",
    "Unit Managers",
    "Operation Supervisors",
    "Franchise & Affiliate Agents",
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Our Leadership Team"
        description="Meet the talented individuals with deep business experience and community networks leading Elverra Global"
        backgroundImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">
                Experienced Leadership
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                A talented team of individuals with deep business experience and
                community networks has been established to lead Elverra Global.
                Their expertise and valuable knowledge of navigating local
                business regulations are key to driving successful initiatives.
              </p>
            </div>

            {/* Leadership Team */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {teamRoles.map((role) => (
                <Card
                  key={role.id}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl text-gray-900">
                      {role.position}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 leading-relaxed">{role.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Organizational Structure */}
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  Organizational Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-8">
                  Our organization comprises various roles designed to drive
                  successful initiatives and partnerships:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {organizationRoles.map((role, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-gray-600">
                  Committed to delivering exceptional services and maintaining
                  the highest standards in everything we do.
                </p>
              </Card>

              <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global Vision</h3>
                <p className="text-gray-600">
                  Bringing international experience and perspective to serve our
                  client network communities across the continent.
                </p>
              </Card>

              <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-yellow-50">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Focus</h3>
                <p className="text-gray-600">
                  Dedicated to giving back to communities and creating positive
                  impact wherever we operate.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Team;
