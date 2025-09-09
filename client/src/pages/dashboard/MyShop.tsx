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
import { Plus, Edit, Trash2, Package, DollarSign, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  contact: string;
  isActive: boolean;
  createdAt: string;
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
    
    const response = await fetch(`/api/user/${user.id}/products`);
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/products/categories');
    if (response.ok) {
      const data = await response.json();
      setCategories(data);
    }
  };

  const fetchProductLimit = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/${user.id}/product-limit`);
      if (response.ok) {
        const data = await response.json();
        setProductLimit(data);
      } else if (response.status === 403) {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error fetching product limit:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!user || !newProduct.name || !newProduct.description || !newProduct.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/user/${user.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      if (response.status === 402) {
        const data = await response.json();
        toast.error(`${data.message}. Please make payment to continue.`);
        return;
      }

      if (response.status === 403) {
        const data = await response.json();
        toast.error(data.message);
        return;
      }

      if (response.ok) {
        toast.success('Product added successfully!');
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
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/${user.id}/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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
              Add Product
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
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Limit Info */}
      {productLimit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{productLimit.existingProducts}</div>
                <div className="text-sm text-gray-500">Current Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{productLimit.remainingFree}</div>
                <div className="text-sm text-gray-500">Free Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{productLimit.freeLimit}</div>
                <div className="text-sm text-gray-500">Free Limit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{productLimit.nextProductCost}F</div>
                <div className="text-sm text-gray-500">Next Product Cost</div>
              </div>
            </div>
            {productLimit.nextProductCost > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You've used your free products. Each additional product costs {productLimit.costPerProduct}F.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
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
                  <span className="text-sm">{product.contact}</span>
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
