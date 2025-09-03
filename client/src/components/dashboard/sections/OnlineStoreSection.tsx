import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store,
  Search,
  ShoppingCart,
  Heart,
  Star,
  PlusCircle,
  Package,
  MessageCircle,
  TrendingUp,
  Eye,
  MapPin,
  Filter,
  Flag
} from 'lucide-react';

const OnlineStoreSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const isSeller = membership?.tier === 'premium' || membership?.tier === 'elite';

  // Mock products data
  const [products] = useState([
    {
      id: 1,
      title: 'Samsung Galaxy A54',
      description: 'Latest smartphone with excellent camera',
      price: 250000,
      category: 'Electronics',
      seller: 'TechStore Mali',
      location: 'Bamako, Mali',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      rating: 4.5,
      reviews: 12,
      condition: 'New',
      inStock: true,
      wishlist: false
    },
    {
      id: 2,
      title: 'Traditional Malian Dress',
      description: 'Beautiful handcrafted traditional dress',
      price: 45000,
      category: 'Fashion',
      seller: 'Fashion Plus',
      location: 'Sikasso, Mali',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
      rating: 4.8,
      reviews: 8,
      condition: 'New',
      inStock: true,
      wishlist: true
    },
    {
      id: 3,
      title: 'Motorcycle Yamaha',
      description: 'Reliable motorcycle for city transportation',
      price: 800000,
      category: 'Vehicles',
      seller: 'Moto Mali',
      location: 'Bamako, Mali',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      rating: 4.3,
      reviews: 5,
      condition: 'Used',
      inStock: true,
      wishlist: false
    },
    {
      id: 4,
      title: 'Local Rice (50kg)',
      description: 'Premium quality local rice',
      price: 35000,
      category: 'Food',
      seller: 'Farm Fresh',
      location: 'Mopti, Mali',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop',
      rating: 4.6,
      reviews: 20,
      condition: 'New',
      inStock: true,
      wishlist: false
    }
  ]);

  // Mock seller products (if user is a seller)
  const [myProducts] = useState([
    {
      id: 101,
      title: 'Apple iPhone 13',
      price: 450000,
      category: 'Electronics',
      views: 156,
      inquiries: 8,
      status: 'active',
      stock: 3,
      dateAdded: '2024-01-15'
    },
    {
      id: 102,
      title: 'Office Chair',
      price: 85000,
      category: 'Furniture',
      views: 43,
      inquiries: 2,
      status: 'active',
      stock: 1,
      dateAdded: '2024-01-10'
    }
  ]);

  // Mock messages for sellers
  const [messages] = useState([
    {
      id: 1,
      productTitle: 'Apple iPhone 13',
      buyer: 'Aminata D.',
      message: 'Is this phone still available? Can I see it today?',
      date: '2024-01-22',
      status: 'unread'
    },
    {
      id: 2,
      productTitle: 'Office Chair',
      buyer: 'Ibrahim T.',
      message: 'What is the condition of the chair?',
      date: '2024-01-21',
      status: 'read'
    }
  ]);

  // Mock wishlist
  const [wishlist] = useState([
    {
      id: 2,
      title: 'Traditional Malian Dress',
      price: 45000,
      seller: 'Fashion Plus',
      addedDate: '2024-01-20'
    }
  ]);

  const categories = ['all', 'Electronics', 'Fashion', 'Vehicles', 'Food', 'Furniture', 'Books', 'Sports'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50000', label: 'Under CFA 50,000' },
    { value: '50000-200000', label: 'CFA 50,000 - 200,000' },
    { value: '200000-500000', label: 'CFA 200,000 - 500,000' },
    { value: '500000+', label: 'Over CFA 500,000' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      if (priceRange === '0-50000') matchesPrice = product.price < 50000;
      else if (priceRange === '50000-200000') matchesPrice = product.price >= 50000 && product.price < 200000;
      else if (priceRange === '200000-500000') matchesPrice = product.price >= 200000 && product.price < 500000;
      else if (priceRange === '500000+') matchesPrice = product.price >= 500000;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const toggleWishlist = (productId: number) => {
    // Toggle wishlist functionality
    alert('Wishlist updated!');
  };

  const contactSeller = (productId: number) => {
    alert('Opening chat with seller...');
  };

  const reportListing = (productId: number) => {
    alert('Report submitted. Thank you for helping keep our marketplace safe.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Online Store</h2>
        {isSeller && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Products</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          {isSeller && <TabsTrigger value="my-products">My Products</TabsTrigger>}
          {isSeller && <TabsTrigger value="messages">Messages</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange('all');
                  }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart className={`h-4 w-4 ${product.wishlist ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  <Badge className="absolute top-2 left-2 bg-green-600">
                    {product.condition}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-1">{product.title}</h4>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-600">({product.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        CFA {product.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{product.seller}</p>
                    </div>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={!product.inStock}>
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => contactSeller(product.id)}>
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reportListing(product.id)}>
                      <Flag className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist ({wishlist.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {wishlist.length > 0 ? (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-gray-600">{item.seller}</p>
                        <p className="text-sm text-gray-500">Added: {item.addedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 mb-2">CFA {item.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <Button size="sm">View Product</Button>
                          <Button size="sm" variant="outline">Remove</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400">Start browsing to add products to your wishlist</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isSeller && (
          <TabsContent value="my-products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Products ({myProducts.length})</span>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Price</th>
                        <th className="text-left py-3 px-4 font-semibold">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Views</th>
                        <th className="text-left py-3 px-4 font-semibold">Inquiries</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold">CFA {product.price.toLocaleString()}</td>
                          <td className="py-4 px-4">{product.stock}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                              {product.views}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4 text-blue-400" />
                              {product.inquiries}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline">Promote</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isSeller && (
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Messages ({messages.filter(m => m.status === 'unread').length} unread)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 ${
                        message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{message.buyer}</p>
                          <p className="text-sm text-gray-600">About: {message.productTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{message.date}</p>
                          {message.status === 'unread' && (
                            <Badge className="bg-blue-600">New</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{message.message}</p>
                      <div className="flex gap-2">
                        <Button size="sm">Reply</Button>
                        <Button size="sm" variant="outline">Mark as Read</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default OnlineStoreSection;