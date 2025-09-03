import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  variation?: string;
  inStock: boolean;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Premium Portland Cement 50kg',
      price: 12500,
      currency: 'CFA',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      quantity: 2,
      variation: '50kg - Grey',
      inStock: true,
    },
    {
      id: '2',
      title: 'Samsung Galaxy A54',
      price: 185000,
      currency: 'CFA',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      quantity: 1,
      inStock: true,
    }
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 2500; // Fixed shipping cost
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={() => navigate('/shop')} size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/shop')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Badge variant="secondary">{cartItems.length} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator />}
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        {item.variation && (
                          <p className="text-sm text-gray-600">{item.variation}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(item.price, item.currency)}
                          </span>
                          {item.inStock ? (
                            <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 border-x">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleCheckout}
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Secure checkout with SSL encryption
                </p>
              </CardContent>
            </Card>

            {/* Recommended Products */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <img
                        src={`https://images.unsplash.com/photo-${i === 1 ? '1586953208448' : '1565814329452'}-dc5fada4e4b0?w=100`}
                        alt="Recommended product"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {i === 1 ? 'Iron Rods 12mm' : 'Cement Blocks'}
                        </h4>
                        <p className="text-sm text-green-600 font-semibold">
                          {formatPrice(i === 1 ? 8500 : 450)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;