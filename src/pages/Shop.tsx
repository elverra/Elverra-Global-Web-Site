import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import Layout from '@/components/layout/Layout';
import MembershipGuard from '@/components/auth/MembershipGuard';
import UnifiedPaymentWindow from '@/components/payment/UnifiedPaymentWindow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ShoppingCart, Star, Truck, CheckCircle, Plus, Minus, ShoppingBag } from 'lucide-react';
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
  user_id: string;
  variations?: { size?: string; color?: string; }[];
  stock_quantity?: number;
  rating?: number;
  reviews_count?: number;
  discount_percentage?: number;
  original_price?: number;
  free_delivery?: boolean;
  in_stock?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  image_url?: string;
  valid_until: string;
  premium_only: boolean;
}

const Shop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getMembershipAccess } = useMembership();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isPremiumMember, setIsPremiumMember] = useState(false);
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [showPaymentWindow, setShowPaymentWindow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
    checkPremiumStatus();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOffers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Transform and enhance data for the shop display
      const transformedData = (data || []).map((product: any) => ({
        ...product,
        images: Array.isArray(product.images) ? product.images as string[] : [],
        rating: 4.5,
        reviews_count: Math.floor(Math.random() * 500) + 10,
        stock_quantity: Math.floor(Math.random() * 50) + 1,
        free_delivery: Math.random() > 0.5,
        in_stock: true,
        variations: [
          { size: '50kg', color: 'grey' },
          { size: '25kg', color: 'grey' }
        ]
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/shop-offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data || []);
      } else {
        // If endpoint doesn't exist yet, set empty array
        setOffers([]);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    }
  };

  const checkPremiumStatus = async () => {
    const access = getMembershipAccess();
    setIsPremiumMember(access.membershipTier === 'premium' || access.membershipTier === 'elite');
  };

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    
    if (!user) {
      toast.success(`${product.title} added to your session cart. Sign up to save permanently!`);
      return;
    }
    
    toast.success(`Added ${quantity}x ${product.title} to cart`);
  };

  const handleBuyNow = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    
    if (!user) {
      toast.error('Veuillez vous connecter pour effectuer un achat');
      navigate('/login');
      return;
    }
    
    setSelectedProduct(product);
    setShowPaymentWindow(true);
  };

  const handlePaymentSuccess = () => {
    toast.success('Paiement réussi! Votre commande a été confirmée.');
    setShowPaymentWindow(false);
    setSelectedProduct(null);
    // Optionally refresh products or navigate to order confirmation
  };

  const handlePaymentClose = () => {
    setShowPaymentWindow(false);
    setSelectedProduct(null);
  };

  const getDiscountedPrice = (product: Product) => {
    const access = getMembershipAccess();
    if (access.hasActiveMembership && product.discount_percentage) {
      // Apply client discount based on tier
      const clientDiscount = access.discountLevel;
      const totalDiscount = Math.min(product.discount_percentage + clientDiscount, 50); // Max 50% discount
      return product.price * (1 - totalDiscount / 100);
    }
    return product.price;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'under-10000' && product.price < 10000) ||
                        (priceRange === '10000-50000' && product.price >= 10000 && product.price <= 50000) ||
                        (priceRange === 'over-50000' && product.price > 50000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
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
    <MembershipGuard requiredFeature="shop">
      <Layout>
      {/* Hero Banner Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-blue-600 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Shop Everything <br />
                <span className="text-green-300">You Need</span>
              </h1>
              <p className="text-xl mb-6 text-blue-100">
                Electronics, Home Essentials, Groceries & More - Delivered to Your Doorstep
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge className="bg-green-500 text-white px-4 py-2 text-base">
                  🚚 Free Delivery
                </Badge>
                <Badge className="bg-blue-500 text-white px-4 py-2 text-base">
                  💰 Best Prices
                </Badge>
                <Badge className="bg-yellow-500 text-white px-4 py-2 text-base">
                  ⭐ Premium Quality
                </Badge>
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Browse Categories
                </Button>
              </div>
            </div>

            {/* Right Content - Featured Products Carousel */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200" 
                    alt="Electronics" 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">Electronics</h3>
                  <p className="text-sm text-blue-100">Latest Smartphones & Gadgets</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200" 
                    alt="Construction" 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">Construction</h3>
                  <p className="text-sm text-blue-100">Building Materials & Tools</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200" 
                    alt="Groceries" 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">Groceries</h3>
                  <p className="text-sm text-blue-100">Fresh Food & Essentials</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1586953208448-dc5fada4e4b0?w=200" 
                    alt="Home & Garden" 
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">Home & Garden</h3>
                  <p className="text-sm text-blue-100">Furniture & Appliances</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  {offer.premium_only && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                      Premium Only
                    </Badge>
                  )}
                  {offer.discount_percentage > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {offer.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Valid until {new Date(offer.valid_until).toLocaleDateString()}
                    </span>
                    {offer.premium_only && !isPremiumMember && (
                      <Button size="sm" variant="outline" onClick={() => navigate('/client-subscription')}>
                        Get Membership
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-10000">Under 10,000 CFA</SelectItem>
                  <SelectItem value="10000-50000">10,000 - 50,000 CFA</SelectItem>
                  <SelectItem value="over-50000">Over 50,000 CFA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Products</h2>
            <p className="text-gray-600">{filteredProducts.length} products found</p>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const discountedPrice = getDiscountedPrice(product);
                const quantity = quantities[product.id] || 1;
                
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow relative">
                    {isPremiumMember && product.discount_percentage && (
                      <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500">
                        {product.discount_percentage}% OFF
                      </Badge>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
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
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating} ({product.reviews_count})
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="line-clamp-2 mb-4">
                        {product.description}
                      </CardDescription>
                      
                      {/* Variation Dropdown */}
                      {product.variations && product.variations.length > 0 && (
                        <div className="mb-4">
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select variation" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.variations.map((variation, index) => (
                                <SelectItem key={index} value={`${variation.size}-${variation.color}`}>
                                  {variation.size} - {variation.color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            {formatPrice(discountedPrice, product.currency)}
                          </span>
                          {isPremiumMember && product.discount_percentage && (
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(product.price, product.currency)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {product.free_delivery && (
                            <div className="flex items-center text-green-600">
                              <Truck className="w-4 h-4 mr-1" />
                              Free Delivery
                            </div>
                          )}
                          {product.in_stock && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              In Stock
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="px-2"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 border-x">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="px-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          onClick={() => handleBuyNow(product)}
                        >
                          Acheter Maintenant
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Ajouter au Panier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        </div>
        
        {/* Payment Window */}
        {showPaymentWindow && selectedProduct && (
          <UnifiedPaymentWindow
            plan="product"
            amount={getDiscountedPrice(selectedProduct) * (quantities[selectedProduct.id] || 1)}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
            isOpen={showPaymentWindow}
            preSelectedService="orange_money"
          />
        )}
      </Layout>
    </MembershipGuard>
  );
};

export default Shop;