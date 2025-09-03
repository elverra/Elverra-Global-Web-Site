import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Tag, Store, Gift, Star, MapPin } from 'lucide-react';

const DiscountsSection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock partner stores data
  const [partnerStores] = useState([
    {
      id: 1,
      name: 'TechMart Bamako',
      category: 'Electronics',
      discount: '15%',
      description: 'Electronics and gadgets',
      location: 'Bamako, Mali',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
      rating: 4.5,
      expires: '2024-03-31'
    },
    {
      id: 2,
      name: 'Fashion Plaza',
      category: 'Clothing',
      discount: '20%',
      description: 'Latest fashion trends',
      location: 'Sikasso, Mali',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop',
      rating: 4.8,
      expires: '2024-04-15'
    },
    {
      id: 3,
      name: 'Fresh Market',
      category: 'Food & Drinks',
      discount: '10%',
      description: 'Fresh groceries and local produce',
      location: 'Mopti, Mali',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop',
      rating: 4.3,
      expires: '2024-05-01'
    },
    {
      id: 4,
      name: 'Health Plus Pharmacy',
      category: 'Health',
      discount: '12%',
      description: 'Medicines and health products',
      location: 'Segou, Mali',
      image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&h=200&fit=crop',
      rating: 4.6,
      expires: '2024-03-20'
    }
  ]);

  // Mock personalized offers
  const [personalizedOffers] = useState([
    {
      id: 1,
      title: 'Your Favorite Coffee Shop',
      discount: '25%',
      description: 'Get 25% off at Café Bamako - your most visited coffee spot!',
      validUntil: '2024-02-29',
      used: false
    },
    {
      id: 2,
      title: 'Electronics Deal for You',
      discount: '30%',
      description: 'Special discount on smartphones based on your browsing history',
      validUntil: '2024-03-15',
      used: false
    },
    {
      id: 3,
      title: 'Birthday Special',
      discount: '50%',
      description: 'Happy Birthday! Enjoy 50% off your next purchase',
      validUntil: '2024-02-20',
      used: true
    }
  ]);

  // Mock coupons and points
  const [userPoints] = useState(2450);
  const [availableCoupons] = useState([
    {
      id: 1,
      code: 'WELCOME20',
      discount: '20%',
      description: 'Welcome bonus for new members',
      minSpend: 5000,
      expires: '2024-04-30'
    },
    {
      id: 2,
      code: 'LOYALTY15',
      discount: '15%',
      description: 'Loyalty reward coupon',
      minSpend: 3000,
      expires: '2024-03-31'
    }
  ]);

  const categories = [
    'all',
    'Electronics',
    'Clothing',
    'Food & Drinks',
    'Health',
    'Transportation',
    'Entertainment'
  ];

  const filteredStores = partnerStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const redeemPoints = (pointsRequired: number) => {
    if (userPoints >= pointsRequired) {
      alert(`Successfully redeemed ${pointsRequired} points!`);
    } else {
      alert('Insufficient points for this reward.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Discounts & Offers</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Points</p>
            <p className="text-xl font-bold text-blue-600">{userPoints.toLocaleString()}</p>
          </div>
          <Gift className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Personalized Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Personalized Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizedOffers.map((offer) => (
              <div
                key={offer.id}
                className={`border rounded-lg p-4 ${
                  offer.used ? 'bg-gray-50 opacity-60' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={offer.used ? 'bg-gray-400' : 'bg-green-500'}>
                    {offer.discount} OFF
                  </Badge>
                  {offer.used && <Badge variant="outline">Used</Badge>}
                </div>
                <h4 className="font-semibold mb-2">{offer.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                <p className="text-xs text-gray-500 mb-3">Valid until: {offer.validUntil}</p>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={offer.used}
                  variant={offer.used ? 'outline' : 'default'}
                >
                  {offer.used ? 'Already Used' : 'Use Offer'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search partner stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Stores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Partner Stores ({filteredStores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div key={store.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{store.name}</h4>
                    <Badge className="bg-red-500 text-white">{store.discount} OFF</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{store.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{store.location}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(store.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">{store.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Expires: {store.expires}</p>
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coupons & Redeem Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Coupons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Available Coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableCoupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-500">{coupon.discount} OFF</Badge>
                    <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                      {coupon.code}
                    </code>
                  </div>
                  <h4 className="font-semibold mb-1">{coupon.description}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Min spend: CFA {coupon.minSpend.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Expires: {coupon.expires}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points Redemption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Redeem Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{userPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Available Points</p>
              </div>
              
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">10% Discount Coupon</span>
                    <Badge>500 pts</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => redeemPoints(500)}
                    disabled={userPoints < 500}
                  >
                    Redeem
                  </Button>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Free Delivery Voucher</span>
                    <Badge>750 pts</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => redeemPoints(750)}
                    disabled={userPoints < 750}
                  >
                    Redeem
                  </Button>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">20% Store Credit</span>
                    <Badge>1000 pts</Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => redeemPoints(1000)}
                    disabled={userPoints < 1000}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiscountsSection;