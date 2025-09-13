import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Search, MapPin, Phone, Mail, Eye, Plus, Star, MessageSquare, Store } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location?: string;
  contact_phone?: string;
  contact_email?: string;
  images: string[];
  views: number;
  created_at: string;
  store_id: string;
}

interface Store {
  id: string;
  name: string;
  description?: string;
  location?: string;
  products: Product[];
}

const OnlineStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores'); // ⚡️ endpoint qui retourne aussi les produits
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch stores');
      setStores(result || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error(`Failed to load stores ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostProduct = () => {
    if (user) {
      navigate('/my-account?tab=products');
    } else {
      toast.info('Please login to post products');
      navigate('/login');
    }
  };

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title="Online Store"
        description="Discover stores and their products directly on Elverra"
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Browse Stores</h1>
              <p className="text-gray-600">Find boutiques and explore their products</p>
            </div>
            <Button onClick={handlePostProduct} className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Post Product
            </Button>
          </div>

          {stores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No stores found</h3>
                <p className="text-gray-600">Be the first to create a store and post products!</p>
              </CardContent>
            </Card>
          ) : (
            stores.map((store) => (
              <div key={store.id} className="mb-12">
                {/* Store Header */}
                <div className="flex items-center gap-3 mb-6">
                  <Store className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">{store.name}</h2>
                    {store.description && <p className="text-gray-600">{store.description}</p>}
                  </div>
                </div>

                {/* Products Grid */}
                {store.products.length === 0 ? (
                  <p className="text-gray-500 italic">No products available in this store.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {store.products.map((product) => (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            {product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-gray-400">No Image</div>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{product.category}</Badge>
                            <Badge variant="outline">{product.condition}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-2 mb-3">
                            {product.description}
                          </CardDescription>

                          <div className="space-y-2 mb-4">
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(product.price, product.currency)}
                            </div>

                            {product.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-1" />
                                {product.location}
                              </div>
                            )}

                            <div className="flex items-center text-sm text-gray-500">
                              <Eye className="w-4 h-4 mr-1" />
                              {product.views} views
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OnlineStore;
