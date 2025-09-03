import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Star, MapPin, Phone, Mail } from 'lucide-react';

const Members = () => {
  const memberAffiliates = [
    {
      id: 1,
      name: 'Aminata Diallo',
      location: 'Bamako, Mali',
      referrals: 156,
      earnings: 'CFA 780,000',
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
      level: 'Platinum',
      rating: 4.8,
      phone: '+226 70 23 45 67',
      email: 'ibrahim.traore@email.com'
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Client Affiliates"
        description="Meet our successful Client affiliates earning commissions across our client network"
        backgroundImage="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/affiliates"
      />
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberAffiliates.map((affiliate) => (
              <Card key={affiliate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {affiliate.name}
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {affiliate.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referrals:</span>
                      <span className="font-semibold">{affiliate.referrals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-semibold text-green-600">{affiliate.earnings}</span>
                    </div>
                    <Badge className="bg-blue-500 text-white">{affiliate.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Members;