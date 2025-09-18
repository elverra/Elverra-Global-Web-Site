import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Heart, Users } from 'lucide-react';

const Mission = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Mission & Vision"
        description="Our core purpose and aspirations that drive everything we do at Elverra Global"
        backgroundImage="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/about"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Mission & Vision Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg leading-relaxed text-gray-700">
                    We are a company driven to expose our clients to easy and most affordable access to basic goods and services across our entire network of service centers and that of our partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-lg leading-relaxed text-gray-700">
                    We will invest in sectors that will change lives every day by making enormous savings for clients across our entire network of service outlets through our special discounts and privileges on goods and service offers from our very own outlets.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* About Us Section */}
            <Card className="mb-16">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">About Elverra Global</CardTitle>
                <CardDescription className="text-lg mt-4">
                  Empowering communities through innovative services and partnerships
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg leading-relaxed text-gray-700 text-justify">
                  Elverra Global is a company that offers a diverse range of services and platforms through our unique all-in-one astonishing product called ZENIKA. Our Zenika Card enables our clients to access discounts and special privileges on purchases of goods and services across our network of partners. Our service basket includes a Job Centre, Payday Loans, an Online Store with low hosting fees, a Free Online Library, and our most passionate "Ô Secours" services. Our mission is to provide valuable resources and opportunities for our clients. Through our TikTok campaign, "What Empowerment and Progress really means to me," we're gathering feedback and stories to improve our services and better serve our community. With exciting initiatives and benefits, Elverra Global aims to make a positive impact and support the growth and well-being of our clients worldwide.
                </p>
              </CardContent>
            </Card>

            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-white">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Focus</h3>
                <p className="text-gray-600">
                  Dedicated to creating positive impact and supporting the growth and well-being of our clients across Africa.
                </p>
              </Card>

              <Card className="text-center p-6 bg-gradient-to-br from-yellow-50 to-white">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Client-Centric</h3>
                <p className="text-gray-600">
                  Everything we do is designed to provide maximum value and convenience to our clients through innovative services.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mission;