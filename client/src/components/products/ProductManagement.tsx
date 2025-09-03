import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Eye, Trash2, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import ProductPostingForm from './ProductPostingForm';
import { useMembership } from '@/hooks/useMembership';

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
  is_active: boolean;
  is_sold: boolean;
  posting_fee_paid: boolean;
  posting_fee_amount: number;
  views: number;
  created_at: string;
}

const ProductManagement = () => {
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;
    
    try {
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
        
        
        
        ;

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(product => ({
        ...product,
        images: Array.isArray(product.images) ? product.images as string[] : []
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductCreated = () => {
    const access = getMembershipAccess();
    
    // Check product listing limits for non-elite members
    if (access.membershipTier !== 'elite' && access.maxProductListings > 0) {
      if (products.length >= access.maxProductListings) {
        toast.error(`${access.membershipTier} membership allows maximum ${access.maxProductListings} product listings. Upgrade to Elite for unlimited listings.`);
        return;
      }
    }
    
    setShowPostForm(false);
    setEditingProduct(null);
    fetchUserProducts();
    toast.success('Product posted successfully!');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowPostForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const mockDeleteResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockDeleteResult;

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const mockToggleResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockToggleResult;

      if (error) throw error;
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_active: !isActive } : p
      ));
      
      toast.success(isActive ? 'Product deactivated' : 'Product activated');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleMarkAsSold = async (productId: string) => {
    try {
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
        
        
        
        ;

      if (error) throw error;
      
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_sold: true, is_active: false } : p
      ));
      
      toast.success('Product marked as sold');
    } catch (error) {
      console.error('Error marking product as sold:', error);
      toast.error('Failed to mark product as sold');
    }
  };

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const getStatusBadge = (product: Product) => {
    if (product.is_sold) {
      return <Badge variant="secondary">Sold</Badge>;
    }
    if (!product.posting_fee_paid) {
      return <Badge variant="destructive">Payment Pending</Badge>;
    }
    if (!product.is_active) {
      return <Badge variant="outline">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.is_active && p.posting_fee_paid && !p.is_sold);
  const pendingProducts = products.filter(p => !p.posting_fee_paid);
  const soldProducts = products.filter(p => p.is_sold);
  const inactiveProducts = products.filter(p => !p.is_active && p.posting_fee_paid && !p.is_sold);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Products</h2>
          <p className="text-gray-600">
            Manage your product listings
            {(() => {
              const access = getMembershipAccess();
              if (access.membershipTier !== 'elite' && access.maxProductListings > 0) {
                return ` (${products.length}/${access.maxProductListings} used)`;
              }
              return '';
            })()}
          </p>
        </div>
        <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                const access = getMembershipAccess();
                if (access.membershipTier !== 'elite' && access.maxProductListings > 0 && products.length >= access.maxProductListings) {
                  toast.error(`${access.membershipTier} membership allows maximum ${access.maxProductListings} product listings. Upgrade to Elite for unlimited listings.`);
                  return;
                }
                setEditingProduct(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Post New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Update your product information'
                  : 'Fill in the details to post your product. A posting fee of 500 CFA applies.'
                }
              </DialogDescription>
            </DialogHeader>
            <ProductPostingForm
              product={editingProduct}
              onSuccess={handleProductCreated}
              onCancel={() => {
                setShowPostForm(false);
                setEditingProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({products.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeProducts.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingProducts.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveProducts.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({soldProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProductsList 
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleActive={handleToggleActive}
            onMarkAsSold={handleMarkAsSold}
            formatPrice={formatPrice}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="active">
          <ProductsList 
            products={activeProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleActive={handleToggleActive}
            onMarkAsSold={handleMarkAsSold}
            formatPrice={formatPrice}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="pending">
          <ProductsList 
            products={pendingProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleActive={handleToggleActive}
            onMarkAsSold={handleMarkAsSold}
            formatPrice={formatPrice}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="inactive">
          <ProductsList 
            products={inactiveProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleActive={handleToggleActive}
            onMarkAsSold={handleMarkAsSold}
            formatPrice={formatPrice}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="sold">
          <ProductsList 
            products={soldProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleActive={handleToggleActive}
            onMarkAsSold={handleMarkAsSold}
            formatPrice={formatPrice}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ProductsListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleActive: (productId: string, isActive: boolean) => void;
  onMarkAsSold: (productId: string) => void;
  formatPrice: (price: number, currency?: string) => string;
  getStatusBadge: (product: Product) => React.ReactNode;
}

const ProductsList = ({ 
  products, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onMarkAsSold, 
  formatPrice, 
  getStatusBadge 
}: ProductsListProps) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg line-clamp-1">{product.title}</CardTitle>
              {getStatusBadge(product)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                {product.views} views
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                
                {!product.is_sold && product.posting_fee_paid && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(product.id, product.is_active)}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                )}
                
                {product.is_active && !product.is_sold && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsSold(product.id)}
                  >
                    Mark Sold
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductManagement;