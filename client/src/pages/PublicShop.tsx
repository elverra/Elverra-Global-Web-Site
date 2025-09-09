import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Mail, MapPin, Filter, Package } from "lucide-react";

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

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function PublicShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      limit: '20',
      offset: ((currentPage - 1) * 20).toString()
    });

    if (selectedCategory !== 'all') {
      params.append('category', selectedCategory);
    }

    if (searchQuery) {
      params.append('search', searchQuery);
    }

    const response = await fetch(`/api/shop/products?${params}`);
    if (response.ok) {
      const data = await response.json();
      setProducts(data.products);
      setHasMore(data.hasMore);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/products/categories');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
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
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                        <Package className="w-12 h-12 text-gray-400" />
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
                        <Badge variant="secondary">
                          {categories.find(c => c.id === product.category)?.name || product.category}
                        </Badge>
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
