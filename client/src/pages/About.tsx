import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Target, Heart, Globe, Eye, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const About = () => {
  const { toast } = useToast();
  const [pageContent, setPageContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      // Fetch about page content from the server API
      const response = await fetch('/api/cms/about');
      
      if (response.ok) {
        const data = await response.json();
        setPageContent(data);
      } else {
        console.log('No about contet found, using default content');
      }
    } catch (error: any) {
      console.error('Error fetching about content:', error);
      toast({
        title: "Error",
        description: "Failed to load about content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PremiumBanner
        title="About Elverra Global"
        description="Learn about our mission, vision, and commitment to empowering communities through innovative client benefits."
        backgroundImage="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* About Content Section */}
            <div className="mb-16">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
                <CardContent className="p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">About Elverra Global</h2>
                  <div className="prose prose-lg max-w-none text-gray-700 text-center leading-relaxed">
                    <p className="text-xl mb-6">
                      <strong>Elverra Global</strong> is a company that offers a diverse range of services and platforms through our unique all-in-one astonishing product called <strong>ZENIKA</strong>. Our Zenika Card enables our clients to access discounts and special privileges on purchases of goods and services across our client network.
                    </p>
                    <p className="text-lg mb-6">
                      Our service basket includes a Job Centre, Payday Loans, an Online Store with low hosting fees, a Free Online Library, and our most passionate "Ô Secours" services. Our mission is to provide valuable resources and opportunities for our clients.
                    </p>
                    <p className="text-lg mb-6">
                      Through our TikTok campaign, <em>"empowerment and progress really means to me,"</em> we're gathering feedback and stories to improve our services and better serve our community. With exciting initiatives and benefits, Elverra Global aims to make a positive impact and support the growth and well-being of our clients worldwide.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mission and Vision Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Mission */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-100 p-4 rounded-full">
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-purple-900">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-gray-700 text-lg leading-relaxed text-center">
                      We are a company driven to expose our clients to easy and most affordable access to basic goods and services across our entire network of service centers and that of our partners.
                    </p>
                  </CardContent>
                </Card>

                {/* Vision */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-100 p-4 rounded-full">
                        <Eye className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-purple-900">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-gray-700 text-lg leading-relaxed text-center">
                      We will invest in sectors that will change lives every day by making enormous savings for clients across our entire network service outlets through our special discounts and privileges on goods and service offers from our very own outlets.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Dynamic Content Section */}
            {pageContent && (
              <div className="text-center mb-16">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-8 md:p-12">
                    <div 
                      className="prose prose-lg max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: pageContent.content }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Our Team</CardTitle>
                  <CardDescription>Meet the people behind Elverra</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/about/association-members">View Team</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Our Projects</CardTitle>
                  <CardDescription>Community impact initiatives</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/about/projects">View Projects</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Partners</CardTitle>
                  <CardDescription>Our trusted partners</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/about/partners">View Partners</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Impact Stories</CardTitle>
                  <CardDescription>Lives we've changed</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/about/changing-lives">View Stories</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Section */}
            <div className="text-center">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
                  <p className="text-gray-600 mb-6">
                    Have questions about our services or want to learn more? 
                    We'd love to hear from you.
                  </p>
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Link to="/about/contact">Contact Us</Link>
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

export default About;
