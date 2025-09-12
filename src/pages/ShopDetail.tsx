import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShoppingCart, Phone, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';

interface Shop {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  contact?: string;
  createdAt: string;
  imageUrl?: string;
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
  stock?: number | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
}

export default function ShopDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [wishIds, setWishIds] = useState<Set<string>>(new Set());
  const [wishBusy, setWishBusy] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try extended fields first; fallback to minimal if columns don't exist
        let s: any = null;
        {
          const { data, error } = await supabase
            .from('shops')
            .select('id, owner_id, name, slug, description, created_at, image_url, contact, location')
            .eq('slug', slug)
            .maybeSingle();
          if (!error) s = data;
          else if (error && (error.code === '42703' || error.code === 'PGRST204')) {
            const { data: data2, error: se2 } = await supabase
              .from('shops')
              .select('id, owner_id, name, slug, description, created_at')
              .eq('slug', slug)
              .maybeSingle();
            if (se2) throw se2;
            s = data2;
          } else if (error) {
            throw error;
          }
        }
        if (s) {
          setShop({
            id: s.id,
            userId: s.owner_id,
            name: s.name,
            slug: s.slug,
            description: s.description || undefined,
            location: s.location || undefined,
            contact: s.contact || undefined,
            createdAt: s.created_at,
            imageUrl: s.image_url || undefined,
          });
          // Try extended product fields; fallback if columns missing
          let productsRaw: any[] | null = null;
          {
            const { data: p1, error: pe1 } = await supabase
              .from('products')
              .select('id, name, description, price, category, images, image_url, is_active, created_at, stock, contact_phone, contact_whatsapp')
              .eq('shop_id', s.id)
              .eq('is_active', true)
              .order('created_at', { ascending: false });
            if (!pe1) productsRaw = p1 as any[];
            else if (pe1 && (pe1.code === '42703' || pe1.code === 'PGRST204')) {
              const { data: p2, error: pe2 } = await supabase
                .from('products')
                .select('id, name, description, price, category, images, image_url, is_active, created_at')
                .eq('shop_id', s.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });
              if (pe2) throw pe2;
              productsRaw = p2 as any[];
            } else if (pe1) {
              throw pe1;
            }
          }
          const mapped = (productsRaw || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            category: row.category,
            images: row.images || [],
            imageUrl: row.image_url || undefined,
            isActive: row.is_active,
            createdAt: row.created_at,
            stock: typeof row.stock === 'number' ? row.stock : (row.stock ? Number(row.stock) : null),
            contactPhone: row.contact_phone ?? null,
            contactWhatsapp: row.contact_whatsapp ?? null,
          }));
          setProducts(mapped as any);
          // After loading products, also load wishlist ids for current user
          if (user?.id) {
            const { data: ws, error: we } = await supabase
              .from('wishlists')
              .select('product_id')
              .eq('user_id', user.id);
            if (!we && ws) setWishIds(new Set((ws as any[]).map((r: any) => r.product_id)));
          } else {
            setWishIds(new Set());
          }
        } else setShop(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
  }, [slug, user?.id]);

  const toggleWishlist = async (productId: string) => {
    if (!user?.id) {
      alert('Please sign in to use wishlist');
      return;
    }
    try {
      setWishBusy(productId);
      const wished = wishIds.has(productId);
      if (wished) {
        // Find row and delete
        const { data: row, error: ge } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();
        if (ge && ge.code !== 'PGRST116') throw ge;
        if (row) {
          const { error: delErr } = await supabase.from('wishlists').delete().eq('id', (row as any).id);
          if (delErr) throw delErr;
        }
        const next = new Set(wishIds); next.delete(productId); setWishIds(next);
      } else {
        const { error: insErr } = await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, product_id: productId }]);
        if (insErr) throw insErr;
        const next = new Set(wishIds); next.add(productId); setWishIds(next);
      }
    } finally {
      setWishBusy(null);
    }
  };

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
      {/* If banner exists, show hero with overlay card; otherwise show simple header without any banner */}
      {shop.imageUrl ? (
        <div className="relative w-full">
          <div className="w-full h-56 md:h-72 bg-gray-200 overflow-hidden">
            <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4">
            <div className="-mt-12 md:-mt-16 bg-white rounded-xl shadow p-5 md:p-6 flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                {shop.description && (
                  <p className="text-gray-600 mt-2 max-w-2xl">{shop.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  {shop.location && (
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {shop.location}</span>
                  )}
                  {shop.contact && (
                    <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {shop.contact}</span>
                  )}
                </div>
              </div>
              <div className="text-center hidden sm:block">
                <img src={qrUrl} alt="Shop QR" className="w-28 h-28 rounded" />
                <p className="text-xs text-gray-500 mt-2 break-all max-w-[220px]">{publicUrl}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                {shop.description && (
                  <p className="text-gray-600 mt-2 max-w-2xl">{shop.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  {shop.location && (
                    <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {shop.location}</span>
                  )}
                  {shop.contact && (
                    <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {shop.contact}</span>
                  )}
                </div>
              </div>
              <div className="text-center hidden sm:block">
                <img src={qrUrl} alt="Shop QR" className="w-28 h-28 rounded" />
                <p className="text-xs text-gray-500 mt-2 break-all max-w-[220px]">{publicUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
      
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="relative aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {(product.images && product.images[0]) || product.imageUrl ? (
                      <button
                        onClick={() => {
                          const imgs = (product.images && product.images.length > 0)
                            ? product.images
                            : (product.imageUrl ? [product.imageUrl] : []);
                          setGalleryImages(imgs);
                          setGalleryIndex(0);
                          setGalleryOpen(true);
                        }}
                        className="w-full h-full"
                        aria-label={`View images for ${product.name}`}
                      >
                        <img
                          src={(product.images && product.images[0]) || product.imageUrl as string}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </button>
                    ) : (
                      <ShoppingCart className="w-12 h-12 text-gray-400" />
                    )}
                    {/* Heart wishlist button */}
                    <button
                      className={`absolute top-2 right-2 rounded-full p-2 bg-white/90 shadow ${wishIds.has(product.id) ? 'text-red-500' : 'text-gray-600'}`}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      aria-label={wishIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      disabled={wishBusy === product.id}
                    >
                      <Heart className="h-5 w-5" />
                    </button>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{new Intl.NumberFormat('fr-FR').format(product.price)} CFA</span>
                    <Badge>{product.category}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    {typeof product.stock === 'number' && (
                      <div>Stock: <span className="font-medium">{product.stock}</span></div>
                    )}
                    {(product.contactPhone || product.contactWhatsapp) && (
                      <div className="flex flex-wrap gap-3">
                        {product.contactPhone && (
                          <a href={`tel:${product.contactPhone}`} className="text-blue-600 hover:underline">
                            Phone: {product.contactPhone}
                          </a>
                        )}
                        {product.contactWhatsapp && (
                          <a
                            href={`https://wa.me/${product.contactWhatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            WhatsApp: {product.contactWhatsapp}
                          </a>
                        )}
                      </div>
                    )}
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

      {/* Image Gallery Dialog */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Product Images</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            {galleryImages.length > 0 ? (
              <div>
                <div className="relative w-full aspect-video bg-black/5 rounded overflow-hidden">
                  <img
                    src={galleryImages[galleryIndex]}
                    alt={`Image ${galleryIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {galleryImages.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-2">
                      <button
                        className="px-3 py-2 bg-white/80 rounded shadow"
                        onClick={() => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        className="px-3 py-2 bg-white/80 rounded shadow"
                        onClick={() => setGalleryIndex((i) => (i + 1) % galleryImages.length)}
                        aria-label="Next image"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        className={`h-16 rounded overflow-hidden border ${idx === galleryIndex ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setGalleryIndex(idx)}
                        aria-label={`Open image ${idx + 1}`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No images available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
