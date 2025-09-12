import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, MapPin, Phone, Mail, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  contact: string;
  sellerName: string;
  location: string;
  isActive: boolean;
  createdAt: string;
}

type Category = string;

export default function PublicShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<{ id: string; name: string; slug: string; description?: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedCategory, searchQuery, selectedShop]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchShops(),
        fetchCategories(),
        fetchProducts(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      let filteredProducts: Product[] = [] as any;
      if (selectedShop !== 'all') {
        const { data: shop } = await supabase
          .from('shops')
          .select('id, slug')
          .eq('slug', selectedShop)
          .maybeSingle();
        if (shop?.id) {
          const { data } = await supabase
            .from('products')
            .select('id, name, description, price, category, images, contact, seller_name, location, is_active, created_at')
            .eq('shop_id', shop.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          filteredProducts = (data as any) || [];
        }
      } else {
        const { data } = await supabase
          .from('products')
          .select('id, name, description, price, category, images, contact, seller_name, location, is_active, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        filteredProducts = (data as any) || [];
      }
        
        // Apply filters
        if (selectedCategory !== 'all') {
          filteredProducts = filteredProducts.filter((p: any) => p.category === selectedCategory);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter((p: any) => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
          );
        }
        
        // Apply pagination
        const startIndex = (currentPage - 1) * 20;
        const endIndex = startIndex + 20;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts as any);
        setHasMore(endIndex < filteredProducts.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('category')
        .neq('category', null);
      const unique = Array.from(new Set((data || []).map((r: any) => r.category))).filter(Boolean) as string[];
      setCategories(unique);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShops = async () => {
    try {
      const { data } = await supabase
        .from('shops')
        .select('id, name, slug, description')
        .order('created_at', { ascending: false });
      setShops((data as any) || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleShopChange = (slug: string) => {
    setSelectedShop(slug);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' CFA';
  };

  const getContactInfo = (contact: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    
    if (emailRegex.test(contact)) {
      return { type: 'email', value: contact, icon: Mail };
    } else if (phoneRegex.test(contact)) {
      return { type: 'phone', value: contact, icon: Phone };
    } else {
      return { type: 'other', value: contact, icon: Phone };
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Elverra Shop</h1>
          <p className="text-gray-600">Discover products from our community members</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-64">
                <Select value={selectedShop} onValueChange={handleShopChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Shops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shops</SelectItem>
                    {shops.map((s) => (
                      <SelectItem key={s.slug} value={s.slug}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shops Directory */}
        {shops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Shops</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.slice(0, 9).map((s) => (
                <Card key={s.slug} className="hover:shadow transition">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{s.name}</CardTitle>
                        {s.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                        )}
                      </div>
                      <a className="text-blue-600 underline text-sm" href={`/shop/${s.slug}`}>Visit</a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const contactInfo = getContactInfo(product.contact);
              const ContactIcon = contactInfo.icon;
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <Badge>{product.category}</Badge>
                      </div>
                      
                      {product.sellerName && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Sold by: {product.sellerName}</span>
                        </div>
                      )}
                      
                      {product.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{product.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Contact Seller:</span>
                        <div className="flex items-center gap-2">
                          <ContactIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{contactInfo.value}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-3" 
                        variant="outline"
                        onClick={() => {
                          if (contactInfo.type === 'email') {
                            window.location.href = `mailto:${contactInfo.value}?subject=Interested in ${product.name}`;
                          } else if (contactInfo.type === 'phone') {
                            window.location.href = `tel:${contactInfo.value}`;
                          }
                        }}
                      >
                        <ContactIcon className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No products are currently available'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Products'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
