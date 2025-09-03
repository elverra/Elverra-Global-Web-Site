import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Percent, Star, MapPin } from 'lucide-react';

const Merchants = () => {
  const merchants = [
    {
      id: 1,
      name: 'TechMart Electronics',
      sector: 'Electronics',
      location: 'Bamako, Mali',
      discount: '25%',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Fashion Forward',
      sector: 'Clothing',
      location: 'Dakar, Senegal',
      discount: '30%',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Mali Auto Parts',
      sector: 'Automotive',
      location: 'Bamako, Mali',
      discount: '15%',
      rating: 4.5
    },
    {
      id: 4,
      name: 'Fresh Foods Market',
      sector: 'Groceries',
      location: 'Sikasso, Mali',
      discount: '20%',
      rating: 4.7
    },
    {
      id: 5,
      name: 'Health Plus Pharmacy',
      sector: 'Healthcare',
      location: 'Mopti, Mali',
      discount: '12%',
      rating: 4.9
    },
    {
      id: 6,
      name: 'Home & Garden Center',
      sector: 'Home & Garden',
      location: 'Ségou, Mali',
      discount: '18%',
      rating: 4.4
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Merchant Partners"
        description="Discover our merchant partners offering exclusive discounts"
        backgroundImage="https://images.unsplash.com/photo-1466721591366-2d5fba72006d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/affiliates"
      />
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchants.map((merchant) => (
              <Card key={merchant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{merchant.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600">
                    <Store className="h-4 w-4 mr-1" />
                    {merchant.sector}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <div className="flex items-center text-green-600 font-bold">
                        <Percent className="h-4 w-4 mr-1" />
                        {merchant.discount}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {merchant.location}
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

export default Merchants;