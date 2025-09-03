import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Amara Kone',
    position: 'Chief Executive Officer',
    bio: 'Leading Elverra Global with over 15 years of experience in client services and business development across our client network.',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'amara.kone@elverra.com',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 2,
    name: 'Ibrahim Traore',
    position: 'Chief Technology Officer',
    bio: 'Driving innovation and technology solutions to enhance our client experience across our network.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'ibrahim.traore@elverra.com',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 3,
    name: 'Fatou Diallo',
    position: 'Head of Client Relations',
    bio: 'Ensuring exceptional service delivery and building strong relationships with our clients.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'fatou.diallo@elverra.com',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 4,
    name: 'Mamadou Sidibe',
    position: 'Financial Services Director',
    bio: 'Managing our payday loans, ZENIKA card services, and financial solutions for clients.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'mamadou.sidibe@elverra.com',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 5,
    name: 'Aicha Ouattara',
    position: 'Operations Manager',
    bio: 'Overseeing daily operations and ensuring smooth service delivery across our client network.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b242?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'aicha.ouattara@elverra.com',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 6,
    name: 'Boubacar Cisse',
    position: 'Community Outreach Lead',
    bio: 'Building partnerships and expanding our reach within local communities and client networks.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'boubacar.cisse@elverra.com',
    linkedin: '#',
    twitter: '#'
  }
];

const AssociationMembers = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Our Team"
        description="Meet the dedicated professionals behind Elverra Global who work tirelessly to serve our client network."
        backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
                <Link to="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to About
                </Link>
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team of professionals brings together expertise in technology, finance, 
                client relations, and community development to serve our client network.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-100"
                      />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{member.name}</CardTitle>
                    <p className="text-purple-600 font-semibold">{member.position}</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">{member.bio}</p>
                    
                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${member.email}`} className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Twitter className="h-4 w-4 mr-1" />
                          Twitter
                        </a>
                      </Button>
                    </div>
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
                    Interested in making a difference in our client network? 
                    We're always looking for passionate individuals to join our mission.
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