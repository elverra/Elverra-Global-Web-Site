import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import MembershipGuard from '@/components/auth/MembershipGuard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location?: string;
  images: string[];
  views: number;
  created_at: string;
  user_id: string;
  shop_name?: string;
  shop_slug?: string;
  shop_location?: string;
  country?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

const OnlineStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [shops, setShops] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Try selecting related shop info if foreign key is defined
      let rows: any[] = [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name, title, description, price, category, images, image_url, created_at, shop_id, is_active, shops(name, slug, location)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        rows = data as any[];
      } else {
        // Fallback without relation
        const { data: p2, error: e2 } = await supabase
          .from('products')
          .select('id, name, title, description, price, category, images, image_url, created_at, shop_id, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (e2) throw e2;
        // Fetch shops separately for mapping
        const shopIds = Array.from(new Set((p2 || []).map((r: any) => r.shop_id).filter(Boolean)));
        let shopsMap: Record<string, { name?: string; slug?: string; location?: string }> = {};
        if (shopIds.length) {
          const { data: shopsData } = await supabase
            .from('shops')
            .select('id, name, slug, location')
            .in('id', shopIds);
          (shopsData || []).forEach((s: any) => { shopsMap[s.id] = { name: s.name, slug: s.slug, location: s.location }; });
        }
        rows = (p2 || []).map((r: any) => ({ ...r, shops: shopsMap[r.shop_id] || null }));
      }
      const transformedData: Product[] = (rows || []).map((row: any) => {
        const shopName = row.shops?.name || undefined;
        const shopSlug = row.shops?.slug || undefined;
        const shopLoc = row.shops?.location || undefined;
        const country = shopLoc ? (shopLoc.split(',').map((s: string) => s.trim()).pop() || shopLoc) : undefined;
        return {
          id: row.id,
          title: row.name || row.title,
          description: row.description || '',
          price: Number(row.price) || 0,
          currency: 'CFA',
          category: row.category || 'Uncategorized',
          condition: 'New',
          location: row.location || shopLoc || '',
          images: Array.isArray(row.images) ? row.images : (row.image_url ? [row.image_url] : []),
          views: 0,
          created_at: row.created_at,
          user_id: '',
          shop_name: shopName,
          shop_slug: shopSlug,
          shop_location: shopLoc,
          country,
        };
      });
      setProducts(transformedData);
      // Build filter sources
      const cats = Array.from(new Set(transformedData.map(p => p.category).filter(Boolean)));
      setCategories(cats.map(c => ({ id: c, name: c })));
      const uniqueCountries = Array.from(new Set(transformedData.map(p => p.country).filter(Boolean))) as string[];
      setCountries(uniqueCountries);
      const uniqueShops = Array.from(new Set(transformedData.map(p => (p.shop_slug && p.shop_name) ? `${p.shop_slug}:::${p.shop_name}` : null).filter(Boolean))) as string[];
      setShops(uniqueShops.map(s => { const [slug, name] = s.split(':::'); return { slug, name }; }));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Categories are built from loaded products now for simplicity
  };

  const handleViewProduct = async (productId: string) => {
    try {
      // TODO: API call - rpc('increment_product_views', { product_id: productId });
      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, views: p.views + 1 } : p
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'under-10000' && product.price < 10000) ||
                        (priceRange === '10000-50000' && product.price >= 10000 && product.price <= 50000) ||
                        (priceRange === 'over-50000' && product.price > 50000);
    const matchesCountry = selectedCountry === 'all' || product.country === selectedCountry;
    const matchesShop = selectedShop === 'all' || product.shop_slug === selectedShop;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesCountry && matchesShop;
  });

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  // Removed post product action for public listing page

  // Reviews modal removed for this page per requirement

  // Rating UI removed

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
    <MembershipGuard requiredFeature="shop">
      <Layout>
        <PremiumBanner
          title="Online Store"
          description="Buy and sell products directly with other Elverra clients"
          backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />

        <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Browse Products</h1>
                <p className="text-gray-600">Discover items posted by Elverra Global members</p>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-10000">Under 10,000 CFA</SelectItem>
                      <SelectItem value="10000-50000">10,000 - 50,000 CFA</SelectItem>
                      <SelectItem value="over-50000">Over 50,000 CFA</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger>
                      <SelectValue placeholder="Shop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shops</SelectItem>
                      {shops.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || selectedCategory !== 'all' || priceRange !== 'all' || selectedCountry !== 'all' || selectedShop !== 'all'
                      ? 'Try adjusting your search criteria' : 'No products available yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
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
                        {product.shop_slug && product.shop_name ? (
                          <button
                            onClick={() => navigate(`/shop/${product.shop_slug}`)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            {product.shop_name}
                          </button>
                        ) : (
                          <Badge variant="outline">{product.condition}</Badge>
                        )}
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
                      {/* Pure display page: no actions here */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
        {/* Review modal removed */}
      </Layout>
    </MembershipGuard>
  );
};

export default OnlineStore;