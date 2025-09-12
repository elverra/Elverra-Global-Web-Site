import { useState, useEffect } from 'react';
// import { affiliateService } from '@/services/mockServices';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Gift, Star, ArrowRight } from "lucide-react";

interface AffiliateProgram {
  id: string;
  title: string;
  description: string;
  commissionRate: number;
  minPayout: number;
  category: string;
  isActive: boolean;
  totalAffiliates: number;
  avgEarnings: number;
}

export default function PublicAffiliates() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchAffiliatePrograms();
  }, []);

  const fetchAffiliatePrograms = async () => {
    try {
      setLoading(true);
      // Mock affiliate programs - will be replaced with Supabase
      const mockPrograms: AffiliateProgram[] = [
        {
          id: '1',
          title: 'Elverra Membership Referral',
          description: 'Earn commissions by referring new members to Elverra Global membership plans.',
          commissionRate: 15,
          minPayout: 25000,
          category: 'Membership',
          isActive: true,
          totalAffiliates: 1247,
          avgEarnings: 45000
        },
        {
          id: '2',
          title: 'Ô Secours Token Referral',
          description: 'Get rewarded for every Ô Secours token purchase made through your referral link.',
          commissionRate: 10,
          minPayout: 15000,
          category: 'Tokens',
          isActive: true,
          totalAffiliates: 892,
          avgEarnings: 28000
        },
        {
          id: '3',
          title: 'Shop Partner Program',
          description: 'Promote products from our marketplace and earn on every successful sale.',
          commissionRate: 8,
          minPayout: 20000,
          category: 'E-commerce',
          isActive: true,
          totalAffiliates: 634,
          avgEarnings: 35000
        }
      ];
      setPrograms(mockPrograms);
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = (programId: string) => {
    // Redirect to registration with affiliate program context
    window.location.href = `/register?program=${programId}`;
  };

  const handleNewsletterSignup = () => {
    if (email) {
      // Mock newsletter signup - will be replaced with real API
      alert('Thank you for subscribing to our affiliate newsletter!');
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join the Elverra Affiliate Program
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Turn your network into income. Earn generous commissions by promoting 
              Elverra's services to your friends, family, and followers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => handleJoinProgram('membership')}>
                <Users className="w-5 h-5 mr-2" />
                Become an Affiliate
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">2,773</div>
              <div className="text-gray-600">Active Affiliates</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">₣108M</div>
              <div className="text-gray-600">Total Commissions Paid</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">15%</div>
              <div className="text-gray-600">Average Commission Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Programs Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our range of affiliate programs and start earning commissions today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge>{program.category}</Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{program.commissionRate}%</div>
                      <div className="text-sm text-gray-500">Commission</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Min. Payout:</span>
                      <span className="font-medium">{program.minPayout.toLocaleString()} CFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Active Affiliates:</span>
                      <span className="font-medium">{program.totalAffiliates.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Avg. Monthly Earnings:</span>
                      <span className="font-medium text-green-600">{program.avgEarnings.toLocaleString()} CFA</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleJoinProgram(program.id)}
                  >
                    Join Program
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
                <p className="text-gray-600">Create your affiliate account and get your unique referral links.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Promote</h3>
                <p className="text-gray-600">Share your links on social media, websites, or directly with contacts.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Earn</h3>
                <p className="text-gray-600">Get paid commissions for every successful referral you generate.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Signup */}
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Get the latest affiliate program updates, tips, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleNewsletterSignup}>
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
