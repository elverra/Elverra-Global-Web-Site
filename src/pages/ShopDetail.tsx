import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart } from 'lucide-react';

interface Shop {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  contact?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
}

export default function ShopDetail() {
  const { slug } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: s, error: se } = await supabase
          .from('shops')
          .select('id, owner_id, name, slug, description, created_at')
          .eq('slug', slug)
          .maybeSingle();
        if (se) throw se;
        if (s) {
          setShop({
            id: s.id,
            userId: s.owner_id,
            name: s.name,
            slug: s.slug,
            description: s.description || undefined,
            location: undefined,
            contact: undefined,
            createdAt: s.created_at,
          });
          const { data: p, error: pe } = await supabase
            .from('products')
            .select('id, name, description, price, category, images, image_url, is_active, created_at')
            .eq('shop_id', s.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          if (pe) throw pe;
          const mapped = (p || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            category: row.category,
            images: row.images || [],
            imageUrl: row.image_url || undefined,
            isActive: row.is_active,
            createdAt: row.created_at,
          }));
          setProducts(mapped as any);
        } else setShop(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Shop not found</h1>
        <p className="text-gray-600 mb-6">The shop you are looking for does not exist.</p>
        <Link to="/shop" className="text-blue-600 underline">Back to shops</Link>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/shop/${shop.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
              {shop.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">{shop.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {shop.location && (
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {shop.location}</span>
                )}
                {shop.contact && (
                  <span>Contact: {shop.contact}</span>
                )}
              </div>
            </div>
            <div className="text-center">
              <img src={qrUrl} alt="Shop QR" className="w-28 h-28 rounded" />
              <p className="text-xs text-gray-500 mt-2 break-all max-w-[220px]">{publicUrl}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    {(product.images && product.images[0]) || product.imageUrl ? (
                      <img
                        src={(product.images && product.images[0]) || product.imageUrl as string}
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
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(product.price)} CFA</span>
                    <Badge>{product.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-gray-600">No products yet</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
