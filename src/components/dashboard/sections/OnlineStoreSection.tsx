import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Heart,
  PlusCircle,
  MessageCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
 

const OnlineStoreSection = () => {
  const { user } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myProductsLoading, setMyProductsLoading] = useState(false);
  const [wishlist, setWishlist] = useState<any[]>([]);
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
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdContactPhone, setNewProdContactPhone] = useState('');
  const [newProdContactWhatsapp, setNewProdContactWhatsapp] = useState('');
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProdFiles, setNewProdFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [shopImageUrl, setShopImageUrl] = useState('');
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  // Edit product modal state (must be inside component)
  const [editOpen, setEditOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactWhatsapp, setEditContactWhatsapp] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  // Confirm delete product dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const uploadFilesToStorage = async (bucket: string, files: File[], pathPrefix?: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const base = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `${pathPrefix ? `${pathPrefix}/` : ''}${base}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
      if (upErr) {
        // If the storage bucket doesn't exist or is misconfigured, do not block the flow.
        // Continue without images and surface a helpful message.
        const msg = String(upErr?.message || '').toLowerCase();
        if (msg.includes('bucket not found') || msg.includes('not found')) {
          toast({ title: 'Storage bucket missing', description: `The storage bucket "${bucket}" does not exist. Upload skipped.`, variant: 'destructive' });
          return [];
        }
        throw upErr;
      }
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
        .select('id, name, description, slug, image_url, contact, location')
        .eq('owner_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error; // ignore No rows
      setMyShop(data || null);
      if (data) {
        setShopName(data.name || '');
        setShopDescription(data.description || '');
        if (data.location) setShopLocation(data.location);
        if (data.contact) setShopContact(data.contact);
        if (data.image_url) setShopImageUrl(data.image_url);
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
      while (attempt < maxAttempts) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        try {
          let currentShopId = myShop?.id || null;
          // 1) Ensure shop exists (create first if missing, without image_url)
          if (!currentShopId) {
            const createPayload: any = { name: shopName.trim(), description: shopDescription.trim(), slug, owner_id: user.id };
            const { data: created, error: createErr } = await supabase
              .from('shops')
              .insert([createPayload])
              .select('id, name, description, slug')
              .maybeSingle();
            if (createErr) throw createErr;
            currentShopId = created?.id || null;
            if (!currentShopId) throw new Error('Failed to create shop');
            setMyShop(created);
          } else {
            // If shop exists, update basic fields (without image_url yet)
            const baseUpdate: any = { name: shopName.trim(), description: shopDescription.trim(), slug };
            const { error: upBaseErr } = await supabase
              .from('shops')
              .update(baseUpdate)
              .eq('id', currentShopId);
            if (upBaseErr) throw upBaseErr;
          }

          // 2) Upload banner (if any) now that we have a real shop ID, then update image_url
          let imageUrl = shopImageUrl.trim();
          if (shopImageFile && currentShopId) {
            try {
              const [url] = await uploadFilesToStorage('shop-images', [shopImageFile], `shops/${currentShopId}/banner`);
              if (url) imageUrl = url;
            } catch (upErr: any) {
              console.error('Shop image upload failed:', upErr);
              toast({ title: 'Image upload failed', description: upErr?.message || 'Could not upload shop image. Please check that the storage bucket exists.', variant: 'destructive' });
            }
          }
          if (imageUrl && currentShopId) {
            const { error: imgErr } = await supabase
              .from('shops')
              .update({ image_url: imageUrl })
              .eq('id', currentShopId);
            if (imgErr) throw imgErr;
          }

          toast({ title: 'Saved', description: 'Your shop has been saved.' });
          await Promise.all([fetchProducts(), fetchMyShop()]);
          break; // success
        } catch (e: any) {
          console.error('Supabase save shop error:', e);
          // Handle missing columns gracefully (contact/location) — skip silently
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
      setMyProductsLoading(true);
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
        stock: typeof row.stock === 'number' ? row.stock : 0,
        views: 0,
        inquiries: 0,
        status: row.is_active ? 'active' : 'inactive',
        description: row.description || '',
        contact_phone: row.contact_phone || '',
        contact_whatsapp: row.contact_whatsapp || '',
      })));
    } catch (error) {
      console.error('Error fetching my products:', error);
      toast({ title: 'Error', description: 'Failed to load my products', variant: 'destructive' });
    } finally {
      setMyProductsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setDeleting(true);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Product has been deleted.' });
      await fetchMyProducts();
    } catch (e: any) {
      console.error('Delete product error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setDeleteTargetId(null);
    }
  };

  // messages feature removed

  const fetchWishlist = async () => {
    if (!user?.id) return;
    try {
      // Load wishlist items for current user
      const { data: w, error } = await supabase
        .from('wishlists')
        .select('id, product_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const productIds = (w || []).map((r: any) => r.product_id);
      if (productIds.length === 0) { setWishlist([]); return; }
      const { data: prods, error: pe } = await supabase
        .from('products')
        .select('id, name, title, price, category, images, image_url')
        .in('id', productIds);
      if (pe) throw pe;
      const list = (prods || []).map((p: any) => ({
        id: p.id,
        title: p.name || p.title || 'Untitled',
        seller: shopName || 'Shop',
        price: Number(p.price) || 0,
        image: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.image_url || ''),
        addedDate: new Date().toISOString().slice(0, 10),
      }));
      setWishlist(list);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      // no-op
    }
  };

  

  const toggleWishlist = async (productId: string) => {
    if (!user?.id) { toast({ title: 'Login required', description: 'Please sign in to use wishlist', variant: 'destructive' }); return; }
    try {
      // Check if exists
      const { data: existing, error: ce } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      if (ce && ce.code !== 'PGRST116') throw ce;
      if (existing) {
        const { error: delErr } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', existing.id);
        if (delErr) throw delErr;
        toast({ title: 'Removed', description: 'Removed from wishlist' });
      } else {
        const { error: insErr } = await supabase
          .from('wishlists')
          .insert([{ user_id: user.id, product_id: productId }]);
        if (insErr) throw insErr;
        toast({ title: 'Saved', description: 'Added to wishlist' });
      }
      await fetchWishlist();
    } catch (e: any) {
      console.error('Wishlist toggle error:', e);
      toast({ title: 'Error', description: e?.message || 'Failed to update wishlist', variant: 'destructive' });
    }
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
              <DialogDescription>
                Upload product images and provide the required fields. Images are stored in Supabase Storage.
              </DialogDescription>
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
                <label className="text-sm font-medium">Description</label>
                <Textarea value={newProdDescription} onChange={(e) => setNewProdDescription(e.target.value)} placeholder="Describe your product" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} placeholder="e.g., Fashion" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} placeholder="e.g., 25" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input value={newProdContactPhone} onChange={(e) => setNewProdContactPhone(e.target.value)} placeholder="e.g., +223XXXXXXXX" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">WhatsApp Contact</label>
                <Input value={newProdContactWhatsapp} onChange={(e) => setNewProdContactWhatsapp(e.target.value)} placeholder="e.g., +223XXXXXXXX" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Upload Images (from your computer)</label>
                <Input type="file" accept="image/*" multiple onChange={(e) => setNewProdFiles(Array.from(e.target.files || []))} />
                <p className="text-xs text-gray-500">You can upload multiple images. They will be uploaded to Supabase Storage and their URLs saved.</p>
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
                  const uploadedUrls = newProdFiles.length ? await uploadFilesToStorage('product-images', newProdFiles, `shops/${myShop.id}/products`) : [];
                  setUploadingImages(false);
                  const imagesArr = [...uploadedUrls];
                  // Keep payload minimal to maximize compatibility across schema variations
                  const basePayload: any = {
                    shop_id: myShop.id,
                    price: Number(newProdPrice),
                    description: newProdDescription.trim() || null,
                    category: newProdCategory.trim() || null,
                    stock: newProdStock ? Number(newProdStock) : null,
                    contact_phone: newProdContactPhone.trim() || null,
                    contact_whatsapp: newProdContactWhatsapp.trim() || null,
                  };
                  if (imagesArr.length) basePayload.images = imagesArr;
                  // Track success and last error for retry logic across schema variations
                  let ok = false;
                  let err: any = null;
                  {
                    const nameVal = newProdName.trim();
                    const { error } = await supabase
                      .from('products')
                      // Try with both name and title to satisfy NOT NULL(title) schemas
                      .insert([{ ...basePayload, name: nameVal, title: nameVal }]);
                    if (!error) { ok = true; }
                    else { err = error; }
                  }
                  // Retry paths for schema differences
                  // 1) If 'title' column missing but 'name' exists → insert with only name
                  if (
                    !ok && (
                      (err?.code === '42703' || err?.code === 'PGRST204') &&
                      /title/i.test(err?.message || '')
                    )
                  ) {
                    const { error: e2 } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, name: newProdName.trim() }]);
                    if (!e2) { ok = true; err = null; }
                    else { err = e2; }
                  }
                  // 2) If 'name' column missing but 'title' exists → insert with only title
                  if (
                    !ok && (
                      (err?.code === '42703' || err?.code === 'PGRST204') &&
                      /name/i.test(err?.message || '')
                    )
                  ) {
                    const { error: eNameMissing } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, title: newProdName.trim() }]);
                    if (!eNameMissing) { ok = true; err = null; }
                    else { err = eNameMissing; }
                  }
                  // If images array column doesn't exist, try image_url
                  if (
                    !ok && (
                      ((err?.code === '42703' || err?.code === 'PGRST204') && /images/i.test(err?.message || ''))
                    )
                  ) {
                    delete basePayload.images;
                    if (imagesArr.length) basePayload.image_url = imagesArr[0];
                    const { error: e3 } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, title: newProdName.trim() }]);
                    if (!e3) { ok = true; err = null; }
                    else { err = e3; }
                  }
                  // If other columns like category or is_active don't exist, retry minimal payload
                  if (
                    !ok && (
                      ((err?.code === '42703' || err?.code === 'PGRST204') && /(category|is_active|stock|contact_phone|contact_whatsapp|description)/i.test(err?.message || ''))
                    )
                  ) {
                    const minimal: any = { shop_id: myShop.id, price: Number(newProdPrice) };
                    const { error: e4 } = await supabase
                      .from('products')
                      .insert([{ ...minimal, title: newProdName.trim() }]);
                    if (!e4) { ok = true; err = null; }
                    else { err = e4; }
                  }
                  // 23502: NOT NULL violation on title -> ensure title is provided
                  if (!ok && err?.code === '23502' && /title/i.test(err?.message || '')) {
                    const { error: e5 } = await supabase
                      .from('products')
                      .insert([{ ...basePayload, title: newProdName.trim() }]);
                    if (!e5) { ok = true; err = null; }
                    else { err = e5; }
                  }
                  if (!ok && err) throw err;
                  toast({ title: 'Created', description: 'Product added successfully' });
                  setAddOpen(false);
                  setNewProdName('');
                  setNewProdPrice('');
                  setNewProdCategory('');
                  setNewProdDescription('');
                  setNewProdStock('');
                  setNewProdContactPhone('');
                  setNewProdContactWhatsapp('');
                  setNewProdFiles([]);
                  await fetchMyProducts();
                } catch (e: any) {
                  console.error('Create product error:', e);
                  toast({ title: 'Error', description: e?.message || 'Failed to create product', variant: 'destructive' });
                } finally {
                  setCreatingProduct(false);
                }
              }} disabled={creatingProduct || uploadingImages} className="bg-blue-600 hover:bg-blue-700">
                {creatingProduct || uploadingImages ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Modal */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete product</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently remove the product from your shop.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteProduct(deleteTargetId as string)} disabled={!deleteTargetId || deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (CFA)</label>
                <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Category</label>
                <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input value={editContactPhone} onChange={(e) => setEditContactPhone(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">WhatsApp Contact</label>
                <Input value={editContactWhatsapp} onChange={(e) => setEditContactWhatsapp(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingProduct}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  if (!editProductId) return;
                  setSavingProduct(true);
                  const payload: any = {
                    price: editPrice ? Number(editPrice) : null,
                    description: editDescription.trim() || null,
                    category: editCategory.trim() || null,
                    stock: editStock ? Number(editStock) : null,
                    contact_phone: editContactPhone.trim() || null,
                    contact_whatsapp: editContactWhatsapp.trim() || null,
                    name: editName.trim() || null,
                    title: editName.trim() || null,
                  };
                  const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', editProductId);
                  if (error) throw error;
                  toast({ title: 'Saved', description: 'Product updated successfully' });
                  setEditOpen(false);
                  await fetchMyProducts();
                } catch (e: any) {
                  console.error('Update product error:', e);
                  toast({ title: 'Error', description: e?.message || 'Failed to update product', variant: 'destructive' });
                } finally {
                  setSavingProduct(false);
                }
              }} disabled={savingProduct} className="bg-blue-600 hover:bg-blue-700">
                {savingProduct ? 'Saving...' : 'Save'}
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
                  {myProductsLoading ? (
                    <div className="py-10 text-center text-gray-500">Loading products…</div>
                  ) : (
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
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditProductId(product.id);
                                setEditName(product.title || '');
                                setEditPrice(String(product.price || ''));
                                setEditDescription(product.description || '');
                                setEditCategory(product.category || '');
                                setEditStock(String(product.stock || ''));
                                setEditContactPhone(product.contact_phone || '');
                                setEditContactWhatsapp(product.contact_whatsapp || '');
                                setEditOpen(true);
                              }}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => { setDeleteTargetId(product.id); setConfirmDeleteOpen(true); }}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
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
                    <div className="mt-2">
                      {(shopImageFile || shopImageUrl) && (
                        <img
                          src={shopImageFile ? URL.createObjectURL(shopImageFile) : shopImageUrl}
                          alt="Shop preview"
                          className="w-full max-w-sm rounded border"
                        />
                      )}
                    </div>
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