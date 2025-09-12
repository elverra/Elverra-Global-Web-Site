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
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  const { getActiveGateways, getGatewayById } = usePaymentGateways();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [paymentData, setPaymentData] = useState({
    phone: '',
    email: '',
    pin: ''
  });
  const [pendingProductData, setPendingProductData] = useState<ProductFormData | null>(null);

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
  }, []);

  const fetchCategories = async () => {
    try {
      const response = null;
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
      // Fallback to default categories if API fails
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
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user) {
      toast.error('Please login to post a product');
      return;
    }

    if (product) {
      // Update existing product (no payment required)
      null;
    } else {
      // New product - show payment dialog
      setPendingProductData(data);
      setShowPaymentDialog(true);
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

  const handlePayment = async () => {
    if (!selectedGateway || !paymentData.phone || !paymentData.email || !pendingProductData) {
      toast.error('Please fill in all payment details');
      return;
    }

    const gateway = getGatewayById(selectedGateway);
    if (!gateway) {
      toast.error('Invalid payment method selected');
      return;
    }

    setProcessingPayment(true);

    try {
      // Create payment request
      const paymentRequest = {
        serviceId: 'product_posting',
        gatewayId: selectedGateway,
        amount: 500,
        currency: 'CFA',
        customerInfo: {
          name: user?.email?.split('@')[0] || 'User',
          email: paymentData.email,
          phone: paymentData.phone
        },
        metadata: {
          productTitle: pendingProductData.title,
          productCategory: pendingProductData.category,
          userId: user?.id
        }
      };

      // Process payment
      const response = await paymentService.processPayment(gateway, paymentRequest);

      if (response.success && response.transactionId) {
        // Payment successful - create product
        null;
      } else {
        toast.error(response.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
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
      setSelectedGateway('');
      setPaymentData({ phone: '', email: '', pin: '' });
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Payment successful but product creation failed. Please contact support.');
    }
  };

  const activeGateways = getActiveGateways();

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

          {!product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Posting Fee Required
                </CardTitle>
                <CardDescription>
                  A posting fee of 500 CFA is required to list your product.
                  This helps maintain quality listings on our platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">500 CFA</div>
                <p className="text-sm text-gray-600 mt-1">
                  You will be prompted for payment after submitting this form
                </p>
              </CardContent>
            </Card>
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Continue to Payment'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Product Listing Fee:</span>
                  <span className="font-medium">500 CFA</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">500 CFA</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Payment Method</Label>
              <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
                <div className="space-y-3">
                  {activeGateways.map((gateway) => (
                    <Label
                      key={gateway.id}
                      htmlFor={gateway.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem value={gateway.id} id={gateway.id} />
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">{gateway.icon}</span>
                        <div>
                          <div className="font-medium">{gateway.name}</div>
                          <div className="text-sm text-gray-500">{gateway.description}</div>
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Payment Details */}
            {selectedGateway && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-phone">Phone Number *</Label>
                  <Input
                    id="payment-phone"
                    placeholder="+223 XX XX XX XX"
                    value={paymentData.phone}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment-email">Email Address *</Label>
                  <Input
                    id="payment-email"
                    type="email"
                    placeholder="your@email.com"
                    value={paymentData.email}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                {selectedGateway === 'moov_money' && (
                  <div>
                    <Label htmlFor="payment-pin">PIN *</Label>
                    <Input
                      id="payment-pin"
                      type="password"
                      placeholder="Enter your 4-digit PIN"
                      maxLength={4}
                      value={paymentData.pin}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, pin: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {(selectedGateway === 'orange_money' || selectedGateway === 'sama_money') && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Payment Instructions</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          You will receive a payment request on your {getGatewayById(selectedGateway)?.name} account. 
                          Please approve the transaction to complete your product listing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                disabled={!selectedGateway || processingPayment || !paymentData.phone || !paymentData.email}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay 500 CFA
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