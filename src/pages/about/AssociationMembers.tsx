import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

const AssociationMembers = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Our Leadership Team"
        description="Meet the executives and department heads who guide our mission and drive organizational success."
        backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                className="text-purple-600 hover:text-purple-700"
              >
                <Link to="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to About
                </Link>
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Meet Our Leadership
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our leadership team ensures effective governance, innovation,
                and growth, while delivering exceptional value to our
                stakeholders.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Join Our Team CTA */}
            <div className="mt-16 text-center">
              <Card className="bg-purple-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Join Our Team</h3>
                  <p className="text-purple-100 mb-6 text-lg">
                    Interested in making a difference? We are always looking for
                    passionate individuals to join our mission.
                  </p>
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/jobs">View Open Positions</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssociationMembers;
