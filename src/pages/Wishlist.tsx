import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, X, Star } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  discount?: number;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: '1',
      title: 'Premium Portland Cement 50kg',
      price: 12500,
      currency: 'CFA',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      rating: 4.5,
      reviews: 128,
      inStock: true,
      discount: 10,
    },
    {
      id: '2',
      title: 'Samsung Galaxy A54 5G',
      price: 185000,
      currency: 'CFA',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      rating: 4.8,
      reviews: 256,
      inStock: true,
    },
    {
      id: '3',
      title: 'Iron Rods 12mm - Pack of 20',
      price: 85000,
      currency: 'CFA',
      image: 'https://images.unsplash.com/photo-1586953208448-dc5fada4e4b0?w=400',
      rating: 4.3,
      reviews: 89,
      inStock: false,
    }
  ]);

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
    toast.success('Item removed from wishlist');
  };

  const addToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast.error('This item is currently out of stock');
      return;
    }
    toast.success(`${item.title} added to cart`);
  };

  const formatPrice = (price: number, currency: string = 'CFA') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price * (1 - discount / 100);
  };

  if (wishlistItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">
              Save items you love for later. They'll appear here.
            </p>
            <Button onClick={() => navigate('/shop')} size="lg">
              Start Shopping
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-gray-600">{wishlistItems.length} items saved for later</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const discountedPrice = getDiscountedPrice(item.price, item.discount);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow relative group">
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Discount Badge */}
                {item.discount && (
                  <Badge className="absolute top-2 left-2 z-10 bg-red-500">
                    {item.discount}% OFF
                  </Badge>
                )}

                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.rating} ({item.reviews})
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Price */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(discountedPrice, item.currency)}
                      </span>
                      {item.discount && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.inStock ? (
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommended Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <img
                      src={`https://images.unsplash.com/photo-${i === 1 ? '1565814329452' : i === 2 ? '1586953208448' : i === 3 ? '1581092795360' : '1618160702438'}-dc5fada4e4b0?w=300`}
                      alt="Recommended product"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <CardTitle className="text-base line-clamp-2">
                    {i === 1 ? 'Cement Blocks Standard' : 
                     i === 2 ? 'Steel Pipes 6 inch' : 
                     i === 3 ? 'Professional Tools Set' : 
                     'Construction Sand 1 Ton'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(i === 1 ? 450 : i === 2 ? 25000 : i === 3 ? 75000 : 18000)}
                    </span>
                    <Button size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;