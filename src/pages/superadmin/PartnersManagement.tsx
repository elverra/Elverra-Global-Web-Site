import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { supabase } from '@/lib/supabaseClient';

interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  partnership_type: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
}

const PartnersManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    partnership_type: 'partner',
    is_active: true,
    featured: false
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  // Mettez à jour la fonction fetchPartners
  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('business_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les partenaires",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        const { data, error } = await supabase
          .from('business_partners')
          .update(formData)
          .eq('id', editingPartner.id)
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Succès", description: "Partenaire mis à jour avec succès" });
      } else {
        const { data, error } = await supabase
          .from('business_partners')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Succès", description: "Partenaire ajouté avec succès" });
      }

      resetForm();
      fetchPartners();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'enregistrement du partenaire",
        variant: "destructive"
      });
    }
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('partner-logos')
        .getPublicUrl(filePath);

      // Mettre à jour le formulaire avec la nouvelle URL
      setFormData({ ...formData, logo_url: publicUrl });

      toast({
        title: "Succès",
        description: "Logo téléchargé avec succès"
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: "Échec du téléchargement du logo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
      const { error } = await supabase
        .from('business_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Succès",
        description: "Partenaire supprimé avec succès"
      });
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression du partenaire",
        variant: "destructive"
      });
    }
  };
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      partnership_type: 'partner',
      is_active: true,
      featured: false
    });
    setEditingPartner(null);
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description || '',
      logo_url: partner.logo_url || '',
      website: partner.website || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      partnership_type: partner.partnership_type,
      is_active: partner.is_active,
      featured: partner.featured
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading partners...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Partners Management</h1>
            <p className="text-gray-600 mt-2">Manage your business partners and collaborations</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Partner Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnership_type">Partnership Type</Label>
                    <Select value={formData.partnership_type} onValueChange={(value) => setFormData({ ...formData, partnership_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="sponsor">Sponsor</SelectItem>
                        <SelectItem value="affiliate">Affiliate</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo">Logo</Label>
                    {formData.logo_url && (
                      <div className="mt-2">
                        <img
                          src={formData.logo_url}
                          alt="Logo actuel"
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPartner ? 'Update Partner' : 'Create Partner'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {partners.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No partners found</p>
                <Button onClick={openAddDialog}>Add your first partner</Button>
              </CardContent>
            </Card>
          ) : (
            partners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {partner.logo_url && (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-16 h-16 object-contain rounded"
                        />
                      )}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {partner.name}
                          {partner.featured && <Badge variant="secondary">Featured</Badge>}
                          {!partner.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{partner.partnership_type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {partner.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={partner.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(partner)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(partner.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {partner.description && (
                  <CardContent>
                    <p className="text-gray-700">{partner.description}</p>
                    {(partner.contact_email || partner.contact_phone) && (
                      <div className="mt-4 text-sm text-gray-600">
                        {partner.contact_email && (
                          <p>Email: <a href={`mailto:${partner.contact_email}`} className="text-blue-600 hover:underline">{partner.contact_email}</a></p>
                        )}
                        {partner.contact_phone && (
                          <p>Phone: <a href={`tel:${partner.contact_phone}`} className="text-blue-600 hover:underline">{partner.contact_phone}</a></p>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PartnersManagement;