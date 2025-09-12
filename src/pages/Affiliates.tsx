
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MembershipGuard from '@/components/membership/MembershipGuard';
import { useAuth } from '@/hooks/useAuth';

const Affiliates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const topAffiliates = [
    {
      id: 1,
      name: 'Aminata Diallo',
      location: 'Bamako, Our Markets',
      referrals: 156,
      earnings: 'CFA 780,000',
      joinDate: '2023-01-15',
      level: 'Diamond',
      rating: 4.9,
      phone: '+223 70 12 34 56',
      email: 'aminata.diallo@email.com'
    },
    {
      id: 2,
      name: 'Ibrahim Traoré',
      location: 'Ouagadougou, Burkina Faso',
      referrals: 134,
      earnings: 'CFA 670,000',
      joinDate: '2023-02-20',
      level: 'Platinum',
      rating: 4.8,
      phone: '+226 70 23 45 67',
      email: 'ibrahim.traore@email.com'
    },
    {
      id: 3,
      name: 'Fatou Cissé',
      location: 'Dakar, Senegal',
      referrals: 112,
      earnings: 'CFA 560,000',
      joinDate: '2023-03-10',
      level: 'Gold',
      rating: 4.7,
      phone: '+221 77 34 56 78',
      email: 'fatou.cisse@email.com'
    },
    {
      id: 4,
      name: 'Moussa Koné',
      location: 'Abidjan, Ivory Coast',
      referrals: 98,
      earnings: 'CFA 490,000',
      joinDate: '2023-04-05',
      level: 'Gold',
      rating: 4.6,
      phone: '+225 07 45 67 89',
      email: 'moussa.kone@email.com'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'bg-blue-500';
      case 'Platinum': return 'bg-purple-500';
      case 'Gold': return 'bg-yellow-500';
      case 'Silver': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const handleJoinAffiliate = () => {
    navigate('/affiliate-dashboard');
  };

  const filteredAffiliates = topAffiliates.filter(affiliate =>
    affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MembershipGuard requiredFeature="canAccessAffiliates" requiredTier="premium">
      <Layout>
        <PremiumBanner
          title="Elverra Affiliate Network"
          description="Join thousands of successful affiliates earning commissions by promoting Elverra Global across our network of markets"
          backgroundImage="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />

        <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Program Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-600 mb-2">2,500+</h3>
                  <p className="text-gray-600">Active Affiliates</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">CFA 45M+</h3>
                  <p className="text-gray-600">Total Paid Out</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">10%</h3>
                  <p className="text-gray-600">Commission Rate</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-orange-600 mb-2">15+</h3>
                  <p className="text-gray-600">Countries</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search affiliates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleJoinAffiliate} className="bg-purple-600 hover:bg-purple-700">
                    Join Program
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Affiliates */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Top Performing Affiliates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredAffiliates.map((affiliate, index) => (
                <Card key={affiliate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {affiliate.name}
                          {index < 3 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {affiliate.location}
                        </div>
                      </div>
                      <Badge className={`${getLevelColor(affiliate.level)} text-white`}>
                        {affiliate.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referrals:</span>
                        <span className="font-semibold">{affiliate.referrals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Earnings:</span>
                        <span className="font-semibold text-green-600">{affiliate.earnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-semibold">{affiliate.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Joined:</span>
                        <span className="text-sm">{new Date(affiliate.joinDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="pt-3 border-t space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {affiliate.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {affiliate.email}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join our affiliate program and start earning 10% commission on every referral.
                  Note: Your affiliate code becomes active only after manager approval to ensure proper orientation.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleJoinAffiliate}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Join Affiliate Program
                </Button>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </Layout>
    </MembershipGuard>
  );
};

export default Affiliates;
