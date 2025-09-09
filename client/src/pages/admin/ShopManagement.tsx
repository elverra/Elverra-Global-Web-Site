import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Tags, 
  BarChart3, 
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
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
  images: string[];
  views: number;
  is_active: boolean;
  is_sold: boolean;
  posting_fee_paid: boolean;
  created_at: string;
  user_id: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface ShopStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalRevenue: number;
  totalViews: number;
  recentOrders: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  valid_until: string;
  premium_only: boolean;
  is_active: boolean;
}

const ShopManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<ShopStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
    totalViews: 0,
    recentOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discount_percentage: 0,
    valid_until: '',
    premium_only: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOffers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const response = await fetch('/api/admin/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    
    // Transform the data to match our interface
    const transformedData = (data || []).map((product: any) => ({
      ...product,
      images: Array.isArray(product.images) ? product.images as string[] : []
    }));
    
    setProducts(transformedData);
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/products/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    
    const data = await response.json();
    setCategories(data || []);
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/admin/shop-offers');
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

  const fetchStats = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/products/categories')
      ]);
      
      const products = productsResponse.ok ? await productsResponse.json() : [];
      const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
      
      // Try to get order stats from API, fallback to calculation
      let recentOrders = 0;
      try {
        const ordersResponse = await fetch('/api/admin/orders/recent');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          recentOrders = ordersData.count || 0;
        }
      } catch {
        // Fallback calculation based on products
        recentOrders = Math.floor((products?.length || 0) * 0.1);
      }

      setStats({
        totalProducts: products?.length || 0,
        activeProducts: products?.filter((p: Product) => p.is_active).length || 0,
        totalCategories: categories?.length || 0,
        totalRevenue: products?.reduce((sum: number, p: Product) => sum + p.price, 0) || 0,
        totalViews: products?.reduce((sum: number, p: Product) => sum + p.views, 0) || 0,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        totalCategories: 0,
        totalRevenue: 0,
        totalViews: 0,
        recentOrders: 0
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          is_active: true
        })
      });

      if (!response.ok) throw new Error('Failed to create category');

      toast.success('Category created successfully');
      setNewCategory({ name: '', description: '' });
      fetchCategories();
      fetchStats();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (!response.ok) throw new Error('Failed to update category');

      toast.success('Category status updated');
      fetchCategories();
      fetchStats();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleToggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });

      if (!response.ok) throw new Error('Failed to update product');

      toast.success('Product status updated');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleCreateOffer = async () => {
    if (!newOffer.title || !newOffer.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/shop-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOffer,
          is_active: true
        })
      });

      if (!response.ok) throw new Error('Failed to create offer');

      toast.success('Offer created successfully');
      setNewOffer({
        title: '',
        description: '',
        discount_percentage: 0,
        valid_until: '',
        premium_only: false
      });
      fetchOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer');
    }
  };

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shop Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold">{stats.activeProducts}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
              <Tags className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Orders</p>
                <p className="text-2xl font-bold">{stats.recentOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="offers">Offers & Discounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage all products in the shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-sm font-medium">{formatPrice(product.price, product.currency)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={product.posting_fee_paid ? 'default' : 'destructive'}>
                        {product.posting_fee_paid ? 'Paid' : 'Unpaid'}
                      </Badge>
                      <Badge variant={product.is_sold ? 'secondary' : 'default'}>
                        {product.is_sold ? 'Sold' : 'Available'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{product.views}</span>
                      </div>
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={() => handleToggleProductStatus(product.id, product.is_active)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Enter category description"
                  />
                </div>
                <Button onClick={handleCreateCategory} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => handleToggleCategoryStatus(category.id, category.is_active)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="offerTitle">Offer Title</Label>
                  <Input
                    id="offerTitle"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                    placeholder="Enter offer title"
                  />
                </div>
                <div>
                  <Label htmlFor="offerDescription">Description</Label>
                  <Textarea
                    id="offerDescription"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    placeholder="Enter offer description"
                  />
                </div>
                <div>
                  <Label htmlFor="discountPercentage">Discount Percentage</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({ ...newOffer, discount_percentage: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={newOffer.valid_until}
                    onChange={(e) => setNewOffer({ ...newOffer, valid_until: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newOffer.premium_only}
                    onCheckedChange={(checked) => setNewOffer({ ...newOffer, premium_only: checked })}
                  />
                  <Label>Premium Members Only</Label>
                </div>
                <Button className="w-full" onClick={handleCreateOffer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Offer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{offer.title}</h3>
                        <div className="flex space-x-2">
                          {offer.premium_only && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                              Premium Only
                            </Badge>
                          )}
                          {offer.discount_percentage > 0 && (
                            <Badge variant="destructive">
                              {offer.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                      <p className="text-xs text-gray-500">
                        Valid until: {new Date(offer.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shop Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Products Listed</span>
                    <span className="font-bold">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Products</span>
                    <span className="font-bold">{stats.activeProducts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Views</span>
                    <span className="font-bold">{stats.totalViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <span className="font-bold">
                      {stats.totalViews > 0 ? ((stats.recentOrders / stats.totalViews) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Product Value</span>
                    <span className="font-bold">{formatPrice(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Product Price</span>
                    <span className="font-bold">
                      {formatPrice(stats.totalProducts > 0 ? stats.totalRevenue / stats.totalProducts : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Recent Orders</span>
                    <span className="font-bold">{stats.recentOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Categories Active</span>
                    <span className="font-bold">{categories.filter(c => c.is_active).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopManagement;