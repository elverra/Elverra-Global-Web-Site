import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
// import { ObjectUploader } from "@/components/ObjectUploader";

// Interfaces pour les données de discount
interface Sector {
  id: string | number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Merchant {
  id: string;
  name: string;
  sector_id: string | number;
  sector?: { name: string };
  discount_percentage: number;
  location?: string;
  location_map_url?: string;
  contact_phone?: string;
  contact_email?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  advantages?: string; // markdown/long text
  gallery_urls?: string[]; // image gallery
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  rating?: number;
}

export default function DiscountManagement() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [creating, setCreating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<{ logo?: boolean; gallery?: boolean; cover?: boolean }>({});
  // dialogs & forms
  const [showSectorDialog, setShowSectorDialog] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [sectorForm, setSectorForm] = useState<{ name: string; description: string; is_active: boolean }>({ name: '', description: '', is_active: true });
  const [sectorSaving, setSectorSaving] = useState(false);

  const [showMerchantDialog, setShowMerchantDialog] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [merchantForm, setMerchantForm] = useState<any>({
    name: '',
    sector_id: '',
    discount_percentage: 0,
    location: '',
    location_map_url: '',
    contact_phone: '',
    contact_email: '',
    description: '',
    website: '',
    logo_url: '',
    cover_image_url: '',
    advantages: '',
    gallery_urls: [],
    rating: 0,
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    // Only load after auth has resolved and user has required admin role
    if (!authLoading && isAdmin) {
      load();
    }
  }, [authLoading, isAdmin]);

  const load = async () => {
    try {
      setLoading(true);
      const [merch, sect] = await Promise.all([
        supabase.from('discount_merchants').select('id,name,sector_id,discount_percentage,location,location_map_url,contact_phone,contact_email,description,website,logo_url,cover_image_url,advantages,gallery_urls,is_featured,is_active,created_at').order('created_at',{ascending:false}),
        supabase.from('discount_sectors').select('id,name,description,is_active')
      ]);
      if (merch.error) throw merch.error;
      if (sect.error) throw sect.error;
      setMerchants(merch.data as any || []);
      setSectors((sect.data as any) || []);
    } catch (e:any) {
      console.error('Load discounts admin error:', e);
      toast({ title:'Error', description: e.message || 'Failed to load data', variant:'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Storage helper
  const uploadToBucket = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('discounts').upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = supabase.storage.from('discounts').getPublicUrl(path);
    return data.publicUrl;
  };

 

  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSectorSaving(true);
      if (editingSector?.id) {
        const { error } = await supabase.from('discount_sectors').update({
          name: sectorForm.name,
          description: sectorForm.description,
          is_active: sectorForm.is_active,
        }).eq('id', editingSector.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('discount_sectors').insert([{ 
          name: sectorForm.name, description: sectorForm.description, is_active: sectorForm.is_active 
        }]);
        if (error) throw error;
      }
      toast({ title: `Sector ${editingSector ? 'updated' : 'created'} successfully` });
      await load();
      setShowSectorDialog(false);
      setSectorForm({ name:'', description:'', is_active:true });
      setEditingSector(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${editingSector ? 'update' : 'create'} sector`,
        variant: 'destructive',
      });
    } finally {
      setSectorSaving(false);
    }
  };

  const handleMerchantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!merchantForm.name || !merchantForm.sector_id || !merchantForm.discount_percentage) {
        toast({ title:'Validation', description:'Name, sector and percentage are required', variant:'destructive' });
        return;
      }
      if (editingMerchant?.id) {
        const payload: any = {
          name: merchantForm.name,
          sector_id: Number(merchantForm.sector_id),
          discount_percentage: merchantForm.discount_percentage,
          location: merchantForm.location || null,
          location_map_url: merchantForm.location_map_url || null,
          contact_phone: merchantForm.contact_phone || null,
          contact_email: merchantForm.contact_email || null,
          description: merchantForm.description || null,
          website: merchantForm.website || null,
          logo_url: merchantForm.logo_url || null,
          cover_image_url: merchantForm.cover_image_url || null,
          advantages: merchantForm.advantages || null,
          gallery_urls: Array.isArray(merchantForm.gallery_urls) ? merchantForm.gallery_urls : null,
          is_active: merchantForm.is_active,
          is_featured: merchantForm.is_featured,
        };
        const { error } = await supabase.from('discount_merchants').update(payload).eq('id', editingMerchant.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('discount_merchants').insert([{ 
          name: merchantForm.name,
          sector_id: Number(merchantForm.sector_id),
          discount_percentage: merchantForm.discount_percentage,
          location: merchantForm.location || null,
          location_map_url: merchantForm.location_map_url || null,
          contact_phone: merchantForm.contact_phone || null,
          contact_email: merchantForm.contact_email || null,
          description: merchantForm.description || null,
          website: merchantForm.website || null,
          logo_url: merchantForm.logo_url || null,
          cover_image_url: merchantForm.cover_image_url || null,
          advantages: merchantForm.advantages || null,
          gallery_urls: Array.isArray(merchantForm.gallery_urls) ? merchantForm.gallery_urls : null,
          is_active: merchantForm.is_active,
          is_featured: merchantForm.is_featured,
        }]).select('id').single();
        if (error) throw error;
        // Optional: handle logoFile/coverFile upload after creation and update logo_url/cover
        if (logoFile) {
          const ext = (logoFile.name.split('.').pop()||'png').toLowerCase();
          const url = await uploadToBucket(logoFile, `merchants/${data.id}/logo.${ext}`);
          await supabase.from('discount_merchants').update({ logo_url: url }).eq('id', data.id);
          setMerchantForm((prev:any)=>({ ...prev, logo_url: url }));
        }
        if (coverFile) {
          const ext = (coverFile.name.split('.').pop()||'jpg').toLowerCase();
          const url = await uploadToBucket(coverFile, `merchants/${data.id}/cover.${ext}`);
          await supabase.from('discount_merchants').update({ cover_image_url: url }).eq('id', data.id);
        }
        // Upload queued advantages file if any
        const pendingAdv: File | undefined = (window as any).pendingAdvantagesFile;
        if (pendingAdv) {
          try {
            const ext = (pendingAdv.name.split('.').pop()||'bin').toLowerCase();
            const url = await uploadToBucket(pendingAdv, `merchants/${data.id}/advantages.${ext}`);
            await supabase.from('discount_merchants').update({ advantages: url }).eq('id', data.id);
            setMerchantForm((prev:any)=>({ ...prev, advantages: url }));
          } finally {
            (window as any).pendingAdvantagesFile = undefined;
          }
        }
        // Upload any queued gallery files and persist URLs
        if (galleryFiles.length > 0) {
          const uploaded: string[] = [];
          for (let i = 0; i < galleryFiles.length; i++) {
            const gf = galleryFiles[i];
            const ext = (gf.name.split('.').pop()||'jpg').toLowerCase();
            const path = `merchants/${data.id}/gallery/${Date.now()}_${i}.${ext}`;
            const url = await uploadToBucket(gf, path);
            uploaded.push(url);
          }
          const current = Array.isArray(merchantForm.gallery_urls) ? merchantForm.gallery_urls : [];
          const finalUrls = [...current, ...uploaded];
          await supabase.from('discount_merchants').update({ gallery_urls: finalUrls }).eq('id', data.id);
          setMerchantForm((prev:any)=>({ ...prev, gallery_urls: finalUrls }));
          setGalleryFiles([]);
        }
      }
      toast({ title:'Success', description:`Merchant ${editingMerchant ? 'updated' : 'created'} successfully` });
      await load();
      setShowMerchantDialog(false);
      setEditingMerchant(null);
      setMerchantForm({ name:'', sector_id:'', discount_percentage:0, location:'', location_map_url:'', contact_phone:'', contact_email:'', description:'', website:'', logo_url:'', cover_image_url:'', advantages:'', gallery_urls:[], is_active:true, is_featured:false, rating:0 });
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save merchant",
        variant: "destructive",
      });
    }
  };

  const deleteSector = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this sector?')) return;

    try {
      const { error } = await supabase.from('discount_sectors').delete().eq('id', id);
      if (error) throw error;
      // Normalize to string for safe comparison across string | number ids
      const idStr = String(id);
      setSectors(prev => prev.filter(s => String(s.id) !== idStr));

      // Also remove any merchants in this sector
      setMerchants(prev => prev.filter(m => String(m.sector_id) !== idStr));

      toast({
        title: "Success",
        description: "Sector deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sector",
        variant: "destructive",
      });
    }
  };

  const deleteMerchant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this merchant?')) return;
    
    try {
      const { error } = await supabase.from('discount_merchants').delete().eq('id', id);
      if (error) throw error;
      setMerchants(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Success",
        description: "Merchant deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete merchant",
        variant: "destructive",
      });
    }
  };

  const resetSectorForm = () => {
    setSectorForm({ name: "", description: "", is_active: true });
    setEditingSector(null);
  };

  const resetMerchantForm = () => {
    setMerchantForm({
      name: "",
      sector_id: "",
      discount_percentage: 0,
      location: "",
      location_map_url: "",
      contact_phone: "",
      contact_email: "",
      description: "",
      website: "",
      logo_url: "",
      cover_image_url: "",
      advantages: "",
      rating: 0,
      is_active: true,
      is_featured: false,
    });
    setEditingMerchant(null);
  };

  const openSectorDialog = (sector?: Sector) => {
    if (sector) {
      setEditingSector(sector);
      setSectorForm(sector);
    } else {
      resetSectorForm();
    }
    setShowSectorDialog(true);
  };

  const openMerchantDialog = (merchant?: Merchant) => {
    if (merchant) {
      setEditingMerchant(merchant);
      setMerchantForm({
        name: merchant.name,
        sector_id: String(merchant.sector_id ?? ''),
        discount_percentage: merchant.discount_percentage,
        location: merchant.location || "",
        location_map_url: merchant.location_map_url || "",
        contact_phone: merchant.contact_phone || "",
        contact_email: merchant.contact_email || "",
        description: merchant.description || "",
        website: merchant.website || "",
        logo_url: merchant.logo_url || "",
        cover_image_url: merchant.cover_image_url || "",
        advantages: merchant.advantages || "",
        gallery_urls: Array.isArray(merchant.gallery_urls) ? merchant.gallery_urls : [],
        is_active: merchant.is_active ?? true,
        is_featured: merchant.is_featured ?? false,
        rating: merchant.rating || 0,
      });
    } else {
      resetMerchantForm();
    }
    setShowMerchantDialog(true);
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <Layout>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discount Management</h1>
                <p className="text-muted-foreground mt-1">Manage discount sectors and merchant partnerships</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>

      <Tabs defaultValue="merchants" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Merchants</h2>
            <Button variant="outline" size="sm" onClick={() => openMerchantDialog()} type="button">
              <Plus className="h-4 w-4 mr-2" />
              Add Merchant
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">{merchant.name}</TableCell>
                      <TableCell>{merchant.sector?.name ?? "N/A"}</TableCell>
                      <TableCell>{merchant.discount_percentage}%</TableCell>
                      <TableCell>{merchant.location ?? ""}</TableCell>
                      <TableCell>
                        <Badge className={merchant.is_active ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                          {merchant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={merchant.is_featured ? "default" : "outline"}>
                          {merchant.is_featured ? "Featured" : "Regular"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMerchantDialog(merchant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMerchant(merchant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Sectors</h2>
            <Button onClick={() => openSectorDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sector
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id}>
                      <TableCell className="font-medium">{sector.name}</TableCell>
                      <TableCell>{sector.description}</TableCell>
                      <TableCell>
                        <Badge className={sector.is_active ? "bg-green-500" : "bg-red-500"}>
                          {sector.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSectorDialog(sector)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSector(sector.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sector Dialog */}
      <Dialog open={showSectorDialog} onOpenChange={setShowSectorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSector ? "Edit Sector" : "Add New Sector"}
            </DialogTitle>
            <DialogDescription>
              {editingSector
                ? "Update the sector details. These changes will reflect on all associated merchants."
                : "Create a new sector to categorize your discount merchants."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSectorSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sector-name">Name</Label>
              <Input
                id="sector-name"
                value={sectorForm.name}
                onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sector-description">Description</Label>
              <Textarea
                id="sector-description"
                value={sectorForm.description}
                onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sector-active"
                checked={sectorForm.is_active}
                onCheckedChange={(checked) => setSectorForm({ ...sectorForm, is_active: checked })}
              />
              <Label htmlFor="sector-active">Active</Label>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={sectorSaving}>
                {sectorSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sectorSaving ? (editingSector ? 'Updating...' : 'Creating...') : (editingSector ? "Update" : "Create")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowSectorDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Merchant Dialog */}
      <Dialog open={showMerchantDialog} onOpenChange={setShowMerchantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMerchant ? "Edit Merchant" : "Add New Merchant"}
            </DialogTitle>
            <DialogDescription>
              {editingMerchant
                ? "Modify merchant information, discount, and visibility settings."
                : "Fill out the merchant details and assign it to a sector."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMerchantSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="merchant-name">Name</Label>
                <Input
                  id="merchant-name"
                  value={merchantForm.name}
                  onChange={(e) => setMerchantForm({ ...merchantForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="merchant-sector">Sector</Label>
                <Select
                  value={merchantForm.sector_id}
                  onValueChange={(value) => setMerchantForm({ ...merchantForm, sector_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.filter(s => s.is_active).map((sector) => (
                      <SelectItem key={String(sector.id)} value={String(sector.id)}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="merchant-discount">Discount Percentage</Label>
                <Input
                  id="merchant-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={merchantForm.discount_percentage}
                  onChange={(e) => setMerchantForm({ ...merchantForm, discount_percentage: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="merchant-location">Location</Label>
                <Input
                  id="merchant-location"
                  value={merchantForm.location}
                  onChange={(e) => setMerchantForm({ ...merchantForm, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="merchant-location-map">Location Map URL (Google Maps)</Label>
                <Input
                  id="merchant-location-map"
                  placeholder="https://maps.google.com/?q=..."
                  value={merchantForm.location_map_url}
                  onChange={(e) => setMerchantForm({ ...merchantForm, location_map_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="merchant-phone">Contact Phone</Label>
                <Input
                  id="merchant-phone"
                  value={merchantForm.contact_phone}
                  onChange={(e) => setMerchantForm({ ...merchantForm, contact_phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="merchant-email">Contact Email</Label>
                <Input
                  id="merchant-email"
                  type="email"
                  value={merchantForm.contact_email}
                  onChange={(e) => setMerchantForm({ ...merchantForm, contact_email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="merchant-website">Website</Label>
              <Input
                id="merchant-website"
                value={merchantForm.website}
                onChange={(e) => setMerchantForm({ ...merchantForm, website: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="merchant-description">Description</Label>
              <Textarea
                id="merchant-description"
                value={merchantForm.description}
                onChange={(e) => setMerchantForm({ ...merchantForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="merchant-advantages">Advantages (text or URL)</Label>
              <Textarea
                id="merchant-advantages"
                placeholder="Ex: -10% sur présentation de la carte, etc."
                value={merchantForm.advantages}
                onChange={(e) => setMerchantForm({ ...merchantForm, advantages: e.target.value })}
              />
              <div className="mt-2 flex items-center gap-3">
                <Input type="file" accept="image/*,application/pdf" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    if (editingMerchant?.id) {
                      const ext = (f.name.split('.').pop()||'bin').toLowerCase();
                      const url = await uploadToBucket(f, `merchants/${editingMerchant.id}/advantages.${ext}`);
                      await supabase.from('discount_merchants').update({ advantages: url }).eq('id', editingMerchant.id);
                      setMerchantForm((prev:any)=>({ ...prev, advantages: url }));
                      toast({ title:'Uploaded', description:'Advantages file uploaded' });
                    } else {
                      // For new merchant, queue by uploading after creation via galleryFiles or set a temp URL
                      // Simpler: upload to a temp path then move after creation is not supported; we’ll upload after create when id known.
                      (window as any).pendingAdvantagesFile = f; // temp stash
                      toast({ title:'Ready', description:'Advantages file will be uploaded after creation' });
                    }
                  } catch (err:any) {
                    toast({ title:'Upload error', description: err.message || 'Failed to upload advantages file', variant:'destructive' });
                  }
                }} />
              </div>
            </div>
            
            {/* Logo Upload Section (Supabase Storage) */}
            <div>
              <Label>Logo/Image Upload</Label>
              <div className="space-y-2">
                {merchantForm.logo_url && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <img 
                      src={merchantForm.logo_url} 
                      alt="Current logo" 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <span className="text-sm text-gray-600">Current logo</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading((u) => ({ ...u, logo: true }));
                      try {
                        if (editingMerchant?.id) {
                          const ext = (f.name.split('.').pop()||'png').toLowerCase();
                          const url = await uploadToBucket(f, `merchants/${editingMerchant.id}/logo.${ext}`);
                          await supabase.from('discount_merchants').update({ logo_url: url }).eq('id', editingMerchant.id);
                          setMerchantForm((prev:any)=>({ ...prev, logo_url: url }));
                          toast({ title: 'Success', description: 'Logo uploaded successfully' });
                        } else {
                          setLogoFile(f);
                          toast({ title: 'Ready', description: 'Logo will be uploaded after creation' });
                        }
                      } catch (err:any) {
                        toast({ title:'Upload error', description: err.message || 'Failed to upload logo', variant:'destructive' });
                      } finally {
                        setUploading((u) => ({ ...u, logo: false }));
                      }
                    }}
                  />
                  {uploading.logo && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                </div>
              </div>
            </div>

            {/* Gallery Upload Section (Supabase Storage) */}
            <div>
              <Label>Gallery Images</Label>
              <div className="space-y-2">
                {Array.isArray(merchantForm.gallery_urls) && merchantForm.gallery_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {merchantForm.gallery_urls.map((url: string, idx: number) => (
                      <div key={idx} className="relative border rounded p-1">
                        <img src={url} alt={`Gallery ${idx+1}`} className="w-full h-24 object-cover rounded" />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute top-1 right-1 h-6 px-2 text-xs"
                          onClick={async () => {
                            const next = merchantForm.gallery_urls.filter((_: string, i: number) => i !== idx);
                            setMerchantForm({ ...merchantForm, gallery_urls: next });
                            if (editingMerchant?.id) {
                              await supabase.from('discount_merchants').update({ gallery_urls: next }).eq('id', editingMerchant.id);
                            }
                          }}
                        >Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      setUploading((u) => ({ ...u, gallery: true }));
                      try {
                        if (editingMerchant?.id) {
                          const uploaded: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const f = files[i];
                            const ext = (f.name.split('.').pop()||'jpg').toLowerCase();
                            const path = `merchants/${editingMerchant.id}/gallery/${Date.now()}_${i}.${ext}`;
                            const url = await uploadToBucket(f, path);
                            uploaded.push(url);
                          }
                          const next = [...(merchantForm.gallery_urls || []), ...uploaded];
                          setMerchantForm({ ...merchantForm, gallery_urls: next });
                          await supabase.from('discount_merchants').update({ gallery_urls: next }).eq('id', editingMerchant.id);
                          toast({ title:'Success', description:'Images added to gallery' });
                        } else {
                          setGalleryFiles((prev) => [...prev, ...files]);
                          toast({ title:'Ready', description:'Gallery images will be uploaded after creation' });
                        }
                      } catch (err:any) {
                        toast({ title:'Upload error', description: err.message || 'Failed to upload images', variant:'destructive' });
                      } finally {
                        setUploading((u) => ({ ...u, gallery: false }));
                      }
                    }}
                  />
                  {uploading.gallery && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                </div>
              </div>
            </div>

            {/* Star Rating Section */}
            <div>
              <Label htmlFor="merchant-rating">Rating (1-5 Stars)</Label>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMerchantForm({ ...merchantForm, rating: star })}
                      className={`p-1 ${
                        star <= (merchantForm.rating || 0)
                          ? 'text-yellow-500' 
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={merchantForm.rating || 0}
                  onChange={(e) => setMerchantForm({ ...merchantForm, rating: Number(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">({merchantForm.rating || 0} stars)</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="merchant-active"
                  checked={merchantForm.is_active}
                  onCheckedChange={(checked) => setMerchantForm({ ...merchantForm, is_active: checked })}
                />
                <Label htmlFor="merchant-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="merchant-featured"
                  checked={merchantForm.is_featured}
                  onCheckedChange={(checked) => setMerchantForm({ ...merchantForm, is_featured: checked })}
                />
                <Label htmlFor="merchant-featured">Featured</Label>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="submit">{editingMerchant ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowMerchantDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}