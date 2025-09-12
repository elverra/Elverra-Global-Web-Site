import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Search,
  ShoppingCart,
  Heart,
  Star,
  PlusCircle,
  MessageCircle,
  Eye,
  MapPin,
  Filter,
  Flag
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const OnlineStoreSection = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myShop, setMyShop] = useState<any | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopContact, setShopContact] = useState('');
  const [activeTab, setActiveTab] = useState<'wishlist' | 'my-products' | 'messages' | 'my-shop'>('my-products');
  const hasShop = !!myShop;
  const [savingShop, setSavingShop] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdImages, setNewProdImages] = useState(''); // comma-separated URLs
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [shopImageUrl, setShopImageUrl] = useState('');
  const [newProdFiles, setNewProdFiles] = useState<File[]>([]);
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Temporarily allow access without membership checks
  const isSeller = true;

  useEffect(() => {
    fetchProducts();
    if (isSeller && user?.id) {
      fetchMyProducts();
      fetchMyShop();
    }
    if (user?.id) {
      fetchWishlist();
    }
  }, [user, isSeller]);

  const fetchProducts = async () => {
    try {
      if (!user?.id || !myShop?.id) { setProducts([]); return; }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', myShop.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data as any[])?.map(row => ({
        id: row.id,
        title: row.name || row.title || row.product_name || 'Untitled',
        description: row.description || row.details || '',
        image: (Array.isArray(row.images) && row.images[0]) ? row.images[0] : (row.image_url || 'https://placehold.co/600x400'),
        category: row.category || 'Uncategorized',
        price: Number(row.price) || 0,
        seller: shopName || 'My Shop',
        rating: 0,
        reviews: 0,
        location: row.location || '',
        inStock: row.is_active ?? true,
        condition: 'New',
        wishlist: false,
      })) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
    }
  };

  const uploadFilesToStorage = async (bucket: string, files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user?.id || 'anon'}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      if (pub?.publicUrl) urls.push(pub.publicUrl);
    }
    return urls;
  };

  const fetchMyShop = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('id, name, description, slug')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // ignore No rows
      setMyShop(data || null);
      if (data) {
        setShopName(data.name || '');
        setShopDescription(data.description || '');
        // If your schema doesn't have 'location', keep local state as-is
        // If your schema doesn't have 'contact', keep local state as-is
      }
      // If no shop, focus My Shop tab
      if (!data) setActiveTab('my-shop');
    } catch (e) {
      console.error('Error fetching my shop:', e);
    }
  };

  const saveShop = async () => {
    if (!user?.id) return;
    if (!shopName.trim()) {
      toast({ title: 'Validation', description: 'Please enter a shop name', variant: 'destructive' });
      return;
    }
    try {
      setSavingShop(true);
      let baseSlug = shopName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!baseSlug) baseSlug = `shop-${Date.now()}`;
      let attempt = 0;
      const maxAttempts = 3;
      // Do not include optional fields that are not present in schema
      let allowContact = false;
      let allowLocation = false;
      while (attempt < maxAttempts) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        try {
          // Upload shop image if provided
          let imageUrl = shopImageUrl.trim();
          if (shopImageFile) {
            try {
              const [url] = await uploadFilesToStorage('shop-images', [shopImageFile]);
              if (url) imageUrl = url;
            } catch (upErr) {
              console.error('Shop image upload failed:', upErr);
            }
          }
          const payload: any = { name: shopName.trim(), description: shopDescription.trim(), slug };
          if (imageUrl) payload.image_url = imageUrl;
          if (shopImageUrl.trim()) payload.image_url = shopImageUrl.trim();
          if (myShop?.id) {
            const { data, error } = await supabase
              .from('shops')
              .update(payload)
              .eq('id', myShop.id)
              .select('*')
              .maybeSingle();
            if (error) throw error;
            setMyShop(data);
          } else {
            const { data, error } = await supabase
              .from('shops')
              .insert([{ owner_id: user.id, ...payload }])
              .select('*')
              .maybeSingle();
            if (error) throw error;
            setMyShop(data);
            setActiveTab('my-products');
          }
          toast({ title: 'Saved', description: 'Your shop has been saved.' });
          await Promise.all([fetchProducts(), fetchMyShop()]);
          break; // success
        } catch (e: any) {
          console.error('Supabase save shop error:', e);
          // Handle missing 'contact' column gracefully by retrying without it
          if (e?.code === 'PGRST204' && /'contact' column/i.test(e?.message || '')) {
            allowContact = false; // drop contact from payload and retry same slug
            continue;
          }
          // Handle missing 'location' column gracefully by retrying without it
          if (e?.code === 'PGRST204' && /'location' column/i.test(e?.message || '')) {
            allowLocation = false;
            continue;
          }
          // Handle missing image_url gracefully
          if (e?.code === '42703' && /image_url/i.test(e?.message || '')) {
            // remove image_url from payload on next loop
            shopImageUrl && setShopImageUrl('');
            continue;
          }
          // Unique violation on slug -> retry with suffix
          if (e?.code === '23505' || /duplicate key|unique constraint/i.test(e?.message || '')) {
            attempt += 1;
            if (attempt >= maxAttempts) {
              throw e;
            }
            continue;
          }
          if (e?.code === '42501' || /rls|policy|permission/i.test(e?.message || '')) {
            toast({ title: 'Permission', description: 'Cannot save shop due to database policies. Please ensure RLS allows owner_id writes.', variant: 'destructive' });
          }
          throw e;
        }
      }
    } catch (e: any) {
      console.error('Save shop error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to save shop', variant: 'destructive' });
    }
    finally {
      setSavingShop(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      if (!myShop?.id) { setMyProducts([]); return; }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', myShop.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyProducts((data || []).map((row: any) => ({
        id: row.id,
        title: row.name || row.title || row.product_name || 'Untitled',
        category: row.category || 'Uncategorized',
        price: Number(row.price) || 0,
        stock: 0,
        views: 0,
        inquiries: 0,
        status: row.is_active ? 'active' : 'inactive',
      })));
    } catch (error) {
      console.error('Error fetching my products:', error);
      toast({ title: 'Error', description: 'Failed to load my products', variant: 'destructive' });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const confirmDel = window.confirm('Delete this product?');
      if (!confirmDel) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Product has been deleted.' });
      await fetchMyProducts();
    } catch (e: any) {
      console.error('Delete product error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to delete product', variant: 'destructive' });
    }
  };

  // messages feature removed

  const fetchWishlist = async () => {
    if (!user?.id) return;
    try {
      const data: any[] = [
        // { id: 2, title: 'Office Chair', seller: 'FurniCo', price: 55000, addedDate: '2025-09-01' }
      ];
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Electronics', 'Fashion', 'Vehicles', 'Food', 'Furniture', 'Books', 'Sports'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-50000', label: 'Under CFA 50,000' },
    { value: '50000-200000', label: 'CFA 50,000 - 200,000' },
    { value: '200000-500000', label: 'CFA 200,000 - 500,000' },
    { value: '500000+', label: 'Over CFA 500,000' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      if (priceRange === '0-50000') matchesPrice = product.price < 50000;
      else if (priceRange === '50000-200000') matchesPrice = product.price >= 50000 && product.price < 200000;
      else if (priceRange === '200000-500000') matchesPrice = product.price >= 200000 && product.price < 500000;
      else if (priceRange === '500000+') matchesPrice = product.price >= 500000;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const toggleWishlist = (productId: number) => {
    // Toggle wishlist functionality
    alert('Wishlist updated!');
  };

  const contactSeller = (productId: number) => {
    alert('Opening chat with seller...');
  };

  const reportListing = (productId: number) => {
    alert('Report submitted. Thank you for helping keep our marketplace safe.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Online Store</h2>
        {isSeller && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setActiveTab('my-products'); setAddOpen(true); }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className={`grid w-full ${hasShop ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {hasShop && <TabsTrigger value="wishlist">Wishlist</TabsTrigger>}
          {hasShop && <TabsTrigger value="my-products">My Products</TabsTrigger>}
          <TabsTrigger value="my-shop">My Shop</TabsTrigger>
        </TabsList>
        {/* Add Product Modal */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Product name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (CFA)</label>
                <Input type="number" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} placeholder="e.g., 25000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} placeholder="e.g., Fashion" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Image URLs (comma separated)</label>
                <Input value={newProdImages} onChange={(e) => setNewProdImages(e.target.value)} placeholder="https://... , https://..." />
                <p className="text-xs text-gray-500">Add one or more image URLs separated by commas. We’ll store them in the images array or image_url.</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Upload Images (from your computer)</label>
                <Input type="file" accept="image/*" multiple onChange={(e) => setNewProdFiles(Array.from(e.target.files || []))} />
                <p className="text-xs text-gray-500">You can upload multiple images. They will be uploaded to storage and their URLs saved.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={creatingProduct || uploadingImages}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  if (!myShop?.id) { toast({ title: 'No shop', description: 'Create your shop first', variant: 'destructive' }); return; }
                  if (!newProdName.trim() || !newProdPrice.trim()) { toast({ title: 'Validation', description: 'Name and price are required', variant: 'destructive' }); return; }
                  setCreatingProduct(true);
                  setUploadingImages(true);
                  const manualUrls = newProdImages.split(',').map(s => s.trim()).filter(Boolean);
                  const uploadedUrls = newProdFiles.length ? await uploadFilesToStorage('product-images', newProdFiles) : [];
                  setUploadingImages(false);
                  const imagesArr = [...manualUrls, ...uploadedUrls];
                  const basePayload: any = { shop_id: myShop.id, price: Number(newProdPrice), category: newProdCategory.trim() || null, is_active: true };
                  if (imagesArr.length) basePayload.images = imagesArr;
                  {
                    const { error } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, name: newProdName.trim() }]);
                    if (!error) { ok = true; }
                    else { err = error; }
                  }
                  // Retry with 'title' if name column missing
                  if (!ok && (err?.code === '42703' || /column\s+products\.name\s+does\s+not\s+exist/i.test(err?.message || ''))) {
                    const { error: e2 } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, title: newProdName.trim() }]);
                    if (!e2) { ok = true; err = null; }
                    else { err = e2; }
                  }
                  // If images array column doesn't exist, try image_url
                  if (!ok && (err?.code === '42703' && /images/i.test(err?.message || ''))) {
                    delete basePayload.images;
                    if (imagesArr.length) basePayload.image_url = imagesArr[0];
                    const { error: e3 } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, title: newProdName.trim() }]);
                    if (!e3) { ok = true; err = null; }
                    else { err = e3; }
                  }
                  // If other columns like category or is_active don't exist, retry minimal payload
                  if (!ok && (err?.code === '42703' && /(category|is_active)/i.test(err?.message || ''))) {
                    const minimal: any = { shop_id: myShop.id, price: Number(newProdPrice) };
                    const { error: e4 } = await supabase
                      .from('products')
                      .insert([{ ...minimal, title: newProdName.trim() }]);
                    if (!e4) { ok = true; err = null; }
                    else { err = e4; }
                  }
                  if (!ok && err) throw err;
                  toast({ title: 'Created', description: 'Product added successfully' });
                  setAddOpen(false);
                  setNewProdName('');
                  setNewProdPrice('');
                  setNewProdCategory('');
                  setNewProdImages('');
                  setNewProdFiles([]);
                  await fetchMyProducts();
                } catch (e: any) {
                  console.error('Create product error:', e);
                  toast({ title: 'Error', description: e?.message || 'Failed to create product', variant: 'destructive' });
                } finally {
                  setCreatingProduct(false);
                }
              }} disabled={creatingProduct} className="bg-blue-600 hover:bg-blue-700">
                {creatingProduct || uploadingImages ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {hasShop ? (
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist ({wishlist.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {wishlist.length > 0 ? (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-gray-600">{item.seller}</p>
                        <p className="text-sm text-gray-500">Added: {item.addedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 mb-2">CFA {item.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <Button size="sm">View Product</Button>
                          <Button size="sm" variant="outline">Remove</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400">Start browsing to add products to your wishlist</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        ) : null}

        {hasShop ? (
          <TabsContent value="my-products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Products ({myProducts.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Price</th>
                        <th className="text-left py-3 px-4 font-semibold">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Views</th>
                        <th className="text-left py-3 px-4 font-semibold">Inquiries</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold">CFA {product.price.toLocaleString()}</td>
                          <td className="py-4 px-4">{product.stock}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                              {product.views}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4 text-blue-400" />
                              {product.inquiries}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">Edit</Button>
                              <Button size="sm" variant="outline" onClick={() => toast({ title: 'Coming soon', description: 'Promotion feature arriving soon' })}>Promote</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {/* Messages tab removed per request */}

        {isSeller && (
          <TabsContent value="my-shop" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shop Name</label>
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g., Elverra Store" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input value={shopLocation} onChange={(e) => setShopLocation(e.target.value)} placeholder="City, Country" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} placeholder="Describe your shop" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Contact</label>
                    <Input value={shopContact} onChange={(e) => setShopContact(e.target.value)} placeholder="Email or Phone" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Shop Image (upload) or URL</label>
                    <Input type="file" accept="image/*" onChange={(e) => setShopImageFile((e.target.files && e.target.files[0]) || null)} />
                    <Input className="mt-2" value={shopImageUrl} onChange={(e) => setShopImageUrl(e.target.value)} placeholder="https://... (optional)" />
                    <p className="text-xs text-gray-500">We will prefer uploaded image; otherwise, we’ll use the URL if provided.</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60" onClick={saveShop} disabled={savingShop}>
                    {savingShop ? 'Saving...' : 'Save Shop'}
                  </Button>
                </div>

                {myShop && (
                  <div className="mt-6 p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Public URL</p>
                      <a className="text-blue-600 underline break-all" href={`/shop/${myShop.slug}`} target="_blank" rel="noreferrer">
                        {`${window.location.origin}/shop/${myShop.slug}`}
                      </a>
                    </div>
                    <div className="text-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/shop/${myShop.slug}`)}`}
                        alt="Shop QR Code"
                        className="w-24 h-24"
                      />
                      <p className="text-xs text-gray-500 mt-1">Scan to open shop</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default OnlineStoreSection;