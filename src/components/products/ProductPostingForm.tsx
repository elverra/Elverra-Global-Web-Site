import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Loader2, AlertCircle, Gift, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['new', 'used', 'refurbished']),
  location: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

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

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface ProductPostingFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductPostingForm = ({ product, onSuccess, onCancel }: ProductPostingFormProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pendingProductData, setPendingProductData] = useState<ProductFormData | null>(null);
  const [productCount, setProductCount] = useState<{
    totalProducts: number;
    freeProductsUsed: number;
    freeProductsRemaining: number;
    requiresPayment: boolean;
    nextProductFee: number;
  } | null>(null);
  const [loadingProductCount, setLoadingProductCount] = useState(true);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      condition: product?.condition as 'new' | 'used' | 'refurbished' || 'new',
      location: product?.location || '',
      contact_phone: product?.contact_phone || '',
      contact_email: product?.contact_email || '',
    },
  });

  useEffect(() => {
    fetchCategories();
    if (user?.id) {
      fetchProductCount();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      // Fallback to default categories
      setCategories([
        { id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
        { id: '2', name: 'Fashion', description: 'Clothing and accessories' },
        { id: '3', name: 'Home & Garden', description: 'Home improvement and garden items' },
        { id: '4', name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
        { id: '5', name: 'Books & Media', description: 'Books, music, and other media' },
        { id: '6', name: 'Automotive', description: 'Car parts and automotive accessories' },
        { id: '7', name: 'Health & Beauty', description: 'Health and beauty products' },
        { id: '8', name: 'Toys & Games', description: 'Toys and gaming items' },
        { id: '9', name: 'Food & Beverages', description: 'Food and drink items' },
        { id: '10', name: 'Other', description: 'Other miscellaneous items' }
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProductCount = async () => {
    if (!user?.id) return;
    
    setLoadingProductCount(true);
    try {
      const response = await fetch(`/api/products/count?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product count');
      }
      
      const result = await response.json();
      console.log('Product count result:', result);
      setProductCount(result.data);
    } catch (error) {
      console.error('Error fetching product count:', error);
      toast.error('Erreur lors du chargement des informations de produit');
    } finally {
      setLoadingProductCount(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour publier un produit');
      return;
    }

    if (product) {
      // Update existing product (no payment required)
      await updateExistingProduct(data);
    } else {
      // New product - check if payment required
      if (!productCount) {
        toast.error('Erreur lors du chargement des informations de produit');
        return;
      }
      
      if (productCount.requiresPayment) {
        // Show payment dialog
        setPendingProductData(data);
        setShowPaymentDialog(true);
      } else {
        // Create product for free
        await createFreeProduct(data);
      }
    }
  };

  const updateExistingProduct = async (data: ProductFormData) => {
    if (!user || !product) return;

    setLoading(true);
    try {
      const contactInfo = `Phone: ${data.contact_phone || 'N/A'}, Email: ${data.contact_email || 'N/A'}`;
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          condition: data.condition,
          location: data.location || null,
          contactInfo: contactInfo
        })
      });

      if (!response.ok) throw new Error('Failed to update product');
      toast.success('Product updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const createFreeProduct = async (data: ProductFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
      const response = await fetch(`${backendUrl}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: user.id,
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          condition: data.condition,
          location: data.location || null,
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email || null,
          posting_fee_paid: false,
          posting_fee_amount: 0,
          is_active: true,
          is_sold: false,
          views: 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      toast.success('Produit créé avec succès! (Produit gratuit)');
      await fetchProductCount(); // Refresh count
      onSuccess();
    } catch (error) {
      console.error('Error creating free product:', error);
      toast.error('Erreur lors de la création du produit');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber || !pendingProductData || !user) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    // Validate phone number format
    if (!/^223\d{8}$/.test(phoneNumber)) {
      toast.error('Format de numéro incorrect. Utilisez le format: 22370445566');
      return;
    }

    setProcessingPayment(true);

    try {
      const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
      const response = await fetch(`${backendUrl}/api/products/initiate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: phoneNumber,
          productData: pendingProductData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du paiement');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Paiement réussi! Votre produit est maintenant en ligne.');
        setShowPaymentDialog(false);
        setPendingProductData(null);
        setPhoneNumber('');
        await fetchProductCount(); // Refresh count
        onSuccess();
      } else {
        throw new Error(result.message || 'Échec du paiement');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement');
    } finally {
      setProcessingPayment(false);
    }
  };

  const createProductWithPayment = async (data: ProductFormData, transactionId: string) => {
    if (!user) return;

    try {
      // Create the product with payment information
      const contactInfo = `Phone: ${data.contact_phone || 'N/A'}, Email: ${data.contact_email || 'N/A'}`;
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id,
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          condition: data.condition,
          location: data.location || null,
          contactInfo: contactInfo,
          isActive: true,
          featured: false,
          viewCount: 0
        })
      });

      if (!response.ok) throw new Error('Failed to create product');

      toast.success('Payment successful! Your product is now live.');
      setShowPaymentDialog(false);
      setPendingProductData(null);
      setPhoneNumber('');
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Payment successful but product creation failed. Please contact support.');
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (CFA) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, area, or region" {...field} />
                </FormControl>
                <FormDescription>
                  Help buyers know where the item is located
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+223 XX XX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!product && productCount && (
            <>
              {/* Free Products Banner */}
              {productCount.freeProductsRemaining > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <Gift className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Produits gratuits!</strong> Il vous reste <strong>{productCount.freeProductsRemaining}</strong> produits gratuits sur 10.
                    Profitez-en pour publier sans frais!
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Payment Required Banner */}
              {productCount.requiresPayment && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Limite atteinte!</strong> Vous avez utilisé vos 10 produits gratuits. 
                    Chaque nouveau produit coûte maintenant <strong>500 FCFA</strong>.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Payment Fee Card */}
              {productCount.requiresPayment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Frais de publication requis
                    </CardTitle>
                    <CardDescription>
                      Un frais de 500 FCFA est requis pour publier ce produit.
                      Cela aide à maintenir la qualité des annonces sur notre plateforme.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">500 FCFA</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Vous serez invité à effectuer le paiement après avoir soumis ce formulaire
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingProductCount}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : loadingProductCount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                product ? 'Mettre à jour le produit' : 
                (productCount?.requiresPayment ? 'Continuer vers le paiement' : 'Publier gratuitement')
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finaliser le paiement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Résumé du paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frais de publication:</span>
                  <span className="font-medium">500 FCFA</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">500 FCFA</span>
                </div>
              </CardContent>
            </Card>

            {/* SAMA Money Payment Method */}
            <div>
              <Label className="text-base font-medium mb-3 block">Méthode de paiement</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <div className="font-medium">SAMA Money</div>
                    <div className="text-sm text-gray-500">Paiement mobile sécurisé</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment-phone">Numéro de téléphone SAMA Money *</Label>
                <Input
                  id="payment-phone"
                  placeholder="22370445566"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 22370445566 (sans espaces ni caractères spéciaux)
                </p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Instructions de paiement</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Vous recevrez une demande de paiement sur votre compte SAMA Money. 
                      Veuillez approuver la transaction pour finaliser la publication de votre produit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)} 
                className="flex-1"
                disabled={processingPayment}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={processingPayment || !phoneNumber}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer 500 FCFA
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductPostingForm;