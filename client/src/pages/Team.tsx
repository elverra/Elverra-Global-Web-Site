import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Globe, Target } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Abou Diarrassouba",
      position: "Co-Founder & CEO, Elverra Global",
      role: "Chairman of the Board",
      image: "/lovable-uploads/ba0c4ad9-7117-4438-8970-8feb00891ba0.png",
      description: "Abou Diarrassouba is the CEO of Elverra Global and Chairman of the Board. He has brought over a decade of international professional experience, including executive leadership. He is also one of the pioneers of the IPASE close client network Platform intended for inauguration in Senegal in 2024, a crowd pulling model designed to serve almost like Elverra Global. His recognition as a 'good citizen' is based on his obsessive dedication to helping the local communities where his businesses reside. Mr. Diarrassouba's passion for entrepreneurship is complemented by an MBA from William Carey University in Hattiesburg, MS (USA).",
      expertise: ["Executive Leadership", "International Business", "Community Development", "Entrepreneurship"]
    },
    {
      name: "Modou Jobe",
      position: "Co-Founder & Deputy CEO, Elverra Global",
      role: "Board of Directors Member",
      image: "/lovable-uploads/b304db8d-403d-412c-aefd-66daa0aa85ac.png",
      description: "Modou Jobe serves as the Deputy CEO of Elverra Global and a member of the Board of Directors. His education in accounting and extensive work in banking and finance on international levels have enabled him to cultivate vast expertise. Modou is an expert in Business Structuring and Product Design, structured finance and commodity trade. He is an entrepreneur with a passionate focus on Social Assurance Services. As a trained Accountant and Seasoned Banker, He explored his diverse experience and nurtured a brilliant career profile in Business Consulting, Trade Brokerage, Structured Finance, Asset & Liquidity Management and High-Level Business Protocols within Africa. He is also one of the pioneers of the Elverra Global crowd pulling model and the IPASE close client network Platform intended for inauguration in Senegal in 2024. For him, 'giving back to the community is as paramount as paying back his shareholders'.",
      expertise: ["Banking & Finance", "Business Structuring", "Structured Finance", "Social Assurance"]
    }
  ];

  const organizationRoles = [
    "CEO",
    "Deputy CEO", 
    "Senior Department Managers",
    "Unit Managers",
    "Operation Supervisors",
    "Franchise & Affiliate Agents"
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
              <h2 className="text-3xl font-bold mb-6">Experienced Leadership</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                A talented team of individuals with deep business experience and community networks has been established to lead Elverra Global. Their expertise and valuable knowledge of navigating local business regulations are key to driving successful initiatives.
              </p>
            </div>

            {/* Leadership Team */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-8">
                    <div className="flex items-start space-x-6 mb-6">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                        <p className="text-lg font-semibold text-purple-600 mb-1">{member.position}</p>
                        <Badge variant="outline" className="text-sm">{member.role}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-6 text-justify">
                      {member.description}
                    </p>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Key Expertise:</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill, skillIndex) => (
                          <Badge key={skillIndex} className="bg-purple-100 text-purple-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  Our organization comprises various roles designed to drive successful initiatives and partnerships:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {organizationRoles.map((role, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold">{index + 1}</span>
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
                  Committed to delivering exceptional services and maintaining the highest standards in everything we do.
                </p>
              </Card>

              <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global Vision</h3>
                <p className="text-gray-600">
                  Bringing international experience and perspective to serve our client network communities across the continent.
                </p>
              </Card>

              <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-yellow-50">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Focus</h3>
                <p className="text-gray-600">
                  Dedicated to giving back to communities and creating positive impact wherever we operate.
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