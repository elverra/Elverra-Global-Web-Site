import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, DollarSign, MapPin, Badge } from 'lucide-react';

const Distributors = () => {
  const distributors = [
    {
      id: 1,
      name: 'Client Network Distribution Hub',
      region: 'Our Client Network',
      location: 'Bamako, Mali',
      sales: 'CFA 25,000,000',
      level: 'Diamond'
    },
    {
      id: 2,
      name: 'Coastal Distribution Network',
      region: 'West Coast',
      location: 'Dakar, Senegal',
      sales: 'CFA 18,500,000',
      level: 'Platinum'
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Distribution Partners"
        description="Meet our regional distribution partners expanding Elverra across our client network"
        backgroundImage="https://images.unsplash.com/photo-1469041797191-50ace28483c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/affiliates"
      />
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {distributors.map((distributor) => (
              <Card key={distributor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{distributor.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {distributor.region}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sales:</span>
                      <span className="font-semibold text-green-600">{distributor.sales}</span>
                    </div>
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

export default Distributors;