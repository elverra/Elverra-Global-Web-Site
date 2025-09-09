import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
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
  const [partnerStores, setPartnerStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts/partners');
      if (response.ok) {
        const data = await response.json();
        setPartnerStores(data);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast({
        title: "Error",
        description: "Failed to load partner discounts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [personalizedOffers, setPersonalizedOffers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchPersonalizedOffers();
    }
  }, [user]);

  const fetchPersonalizedOffers = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/discounts/personalized/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPersonalizedOffers(data);
      }
    } catch (error) {
      console.error('Error fetching personalized offers:', error);
    }
  };

  const [userPoints, setUserPoints] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPoints();
      fetchCoupons();
    }
  }, [user]);

  const fetchUserPoints = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/users/${user.id}/points`);
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchCoupons = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/coupons/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCoupons(data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

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