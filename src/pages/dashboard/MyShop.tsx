import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, DollarSign, AlertCircle, Gift, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  contact?: string;
  isActive: boolean;
  createdAt?: string;
}

interface ProductLimit {
  existingProducts: number;
  freeLimit: number;
  remainingFree: number;
  nextProductCost: number;
  costPerProduct: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function MyShop() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productLimit, setProductLimit] = useState<ProductLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [] as string[],
    contact: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchProductLimit()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchProductLimit = async () => {
    if (!user) return;
    
    try {
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
      const response = await fetch(`${backendUrl}/api/products/count?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product count');
      }
      
      const result = await response.json();
      const data = result.data;
      
      const limit: ProductLimit = {
        existingProducts: data.totalProducts,
        freeLimit: 10,
        remainingFree: data.freeProductsRemaining,
        nextProductCost: data.requiresPayment ? 500 : 0,
        costPerProduct: 500
      };
      setProductLimit(limit);
    } catch (error) {
      console.error('Error fetching product limit:', error);
      // Fallback to mock data
      const mockLimit: ProductLimit = {
        existingProducts: products.length,
        freeLimit: 10,
        remainingFree: Math.max(0, 10 - products.length),
        nextProductCost: products.length >= 10 ? 500 : 0,
        costPerProduct: 500
      };
      setProductLimit(mockLimit);
    }
  };

  const handleAddProduct = async () => {
    if (!user || !newProduct.name || !newProduct.description || !newProduct.category) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      // Check if payment is required for additional products
      if (productLimit && productLimit.remainingFree <= 0) {
        // Redirect to payment page for product creation
        const paymentUrl = `/api/products/initiate-payment?userId=${user.id}&productData=${encodeURIComponent(JSON.stringify(newProduct))}`;
        window.location.href = paymentUrl;
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          category: newProduct.category,
          images: newProduct.images,
          contact: newProduct.contact,
          seller_id: user.id,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast.error('Erreur lors de la création du produit');
        return;
      }

      toast.success('Produit ajouté avec succès!');
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        images: [],
        contact: ''
      });
      setShowAddDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Erreur lors de la suppression du produit');
        return;
      }

      toast.success('Produit supprimé avec succès');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Shop</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {productLimit?.nextProductCost && productLimit.nextProductCost > 0 ? `Ajouter produit (${productLimit.costPerProduct} FCFA)` : 'Ajouter produit gratuit'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe your product"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (CFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact">Contact Info *</Label>
                <Input
                  id="contact"
                  value={newProduct.contact}
                  onChange={(e) => setNewProduct({ ...newProduct, contact: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
              
              <Button onClick={handleAddProduct} className="w-full">
                {productLimit?.nextProductCost && productLimit.nextProductCost > 0 ? `Ajouter produit (${productLimit.costPerProduct} FCFA)` : 'Ajouter produit gratuit'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Limit Banners */}
      {productLimit && (
        <>
          {/* Free Products Banner */}
          {productLimit.remainingFree > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <Gift className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Produits gratuits!</strong> Il vous reste <strong>{productLimit.remainingFree}</strong> produits gratuits sur {productLimit.freeLimit}.
                Profitez-en pour publier sans frais!
              </AlertDescription>
            </Alert>
          )}
          
          {/* Payment Required Banner */}
          {productLimit.nextProductCost > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Limite atteinte!</strong> Vous avez utilisé vos {productLimit.freeLimit} produits gratuits. 
                Chaque nouveau produit coûte maintenant <strong>{productLimit.costPerProduct} FCFA</strong>.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Product Limit Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Statistiques des produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{productLimit.existingProducts}</div>
                  <div className="text-sm text-gray-500">Produits actuels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{productLimit.remainingFree}</div>
                  <div className="text-sm text-gray-500">Gratuits restants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{productLimit.freeLimit}</div>
                  <div className="text-sm text-gray-500">Limite gratuite</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{productLimit.nextProductCost} FCFA</div>
                  <div className="text-sm text-gray-500">Coût prochain produit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="font-semibold">{product.price.toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category:</span>
                  <Badge variant="secondary">
                    {categories.find(c => c.id === product.category)?.name || product.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Contact:</span>
                  <span className="text-sm">{product.contact || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Products Yet</h3>
            <p className="text-gray-500 mb-4">Start selling by adding your first product!</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
