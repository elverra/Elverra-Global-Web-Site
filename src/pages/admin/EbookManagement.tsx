import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Plus, Edit, Trash2, Upload, Eye, Download, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  rating: number;
  downloads: number;
  publish_date: string;
  cover_image_url: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
  tags: string[];
  featured: boolean;
  is_active: boolean;
  is_free: boolean;
  price: number;
  created_at: string;
  updated_at?: string;
}

const categories = [
  'Business & Finance',
  'Technology & Education', 
  'Agriculture & Environment',
  'Healthcare & Medicine',
  'Personal Development',
  'Legal & Governance'
];

type FormData = {
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  publish_date: string;
  cover_image_url: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
  tags: string;
  featured: boolean;
  is_free: boolean;
  price: number;
};

const EbookManagement = () => {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    author: '',
    description: '',
    category: '',
    pages: 0,
    publish_date: new Date().toISOString().split('T')[0],
    cover_image_url: '',
    file_url: '',
    file_type: '',
    file_size_mb: 0,
    tags: '',
    featured: false,
    is_free: true,
    price: 0
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      toast.error('Erreur lors du chargement des ebooks');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('duplicate')) {
          throw new Error('Un fichier avec ce nom existe déjà');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ebooks')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erreur de téléversement:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du téléversement du fichier');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Téléverser l'image de couverture si une nouvelle est sélectionnée
      let coverImageUrl = formData.cover_image_url;
      if (coverFile) {
        const uploadedUrl = await uploadFile(coverFile, 'covers');
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        }
      }

      // Téléverser le fichier ebook si un nouveau est sélectionné
      let fileUrl = formData.file_url;
      let fileType = formData.file_type;
      let fileSizeMb = formData.file_size_mb;

      if (ebookFile) {
        const uploadedUrl = await uploadFile(ebookFile, 'files');
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
          fileType = ebookFile.type;
          fileSizeMb = parseFloat((ebookFile.size / (1024 * 1024)).toFixed(2));
        }
      }

      // Convertir les tags de string à tableau
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      const ebookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        category: formData.category,
        pages: formData.pages,
        publish_date: formData.publish_date,
        cover_image_url: coverImageUrl,
        file_url: fileUrl,
        file_type: fileType,
        file_size_mb: fileSizeMb,
        tags: tagsArray,
        featured: formData.featured,
        is_free: formData.is_free,
        price: formData.price,
        is_active: true,
        downloads: 0,
        rating: 0,
        updated_at: new Date().toISOString()
      };
  
      if (editingEbook) {
        // Mise à jour d'un ebook existant
        const { error: updateError } = await supabase
          .from('ebooks')
          .update(ebookData)
          .eq('id', editingEbook.id);

        if (updateError) throw updateError;
        toast.success('Ebook mis à jour avec succès');
      } else {
        // Création d'un nouvel ebook
        const { error: insertError } = await supabase
          .from('ebooks')
          .insert([{ 
            ...ebookData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
        toast.success('Ebook créé avec succès');
      }
  
      // Réinitialiser le formulaire et fermer le dialogue
      resetForm();
      setDialogOpen(false);
      await fetchEbooks();
      
    } catch (error) {
      console.error('Error saving ebook:', error);
      toast.error(`Erreur lors de la ${editingEbook ? 'mise à jour' : 'création'} de l'ebook`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setFormData({
      title: ebook.title,
      author: ebook.author,
      description: ebook.description,
      category: ebook.category,
      pages: ebook.pages,
      publish_date: ebook.publish_date,
      cover_image_url: ebook.cover_image_url,
      file_url: ebook.file_url,
      file_type: ebook.file_type,
      file_size_mb: ebook.file_size_mb,
      tags: Array.isArray(ebook.tags) ? ebook.tags.join(', ') : '',
      featured: ebook.featured,
      is_free: ebook.is_free,
      price: ebook.price
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ebook ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Supprimer d'abord les fichiers associés s'ils existent
      const ebookToDelete = ebooks.find(e => e.id === id);
      
      if (ebookToDelete?.cover_image_url) {
        const coverPath = ebookToDelete.cover_image_url.split('/').pop();
        if (coverPath) {
          await supabase.storage
            .from('ebooks')
            .remove([`covers/${coverPath}`]);
        }
      }

      if (ebookToDelete?.file_url) {
        const filePath = ebookToDelete.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('ebooks')
            .remove([`files/${filePath}`]);
        }
      }

      // Supprimer l'ebook de la base de données
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Ebook supprimé avec succès');
      await fetchEbooks();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ebook:', error);
      toast.error('Une erreur est survenue lors de la suppression de l\'ebook');
    }
  };

  const toggleFeatured = async (id: string, currentlyFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('ebooks')
        .update({ 
          featured: !currentlyFeatured,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(
        `Ebook ${!currentlyFeatured ? 'mis en avant' : 'retiré des mises en avant'} avec succès`  
      );
      await fetchEbooks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ebook:', error);
      toast.error('Échec de la mise à jour de l\'ebook');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      pages: 0,
      publish_date: new Date().toISOString().split('T')[0],
      cover_image_url: '',
      file_url: '',
      file_type: '',
      file_size_mb: 0,
      tags: '',
      featured: false,
      is_free: true,
      price: 0
    });
    setCoverFile(null);
    setEbookFile(null);
    setEditingEbook(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des ebooks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Ebooks</h1>
          <p className="text-gray-600">Gérez votre bibliothèque numérique</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEbook ? 'Modifier l\'Ebook' : 'Ajouter un nouvel Ebook'}</DialogTitle>
              <DialogDescription>
                {editingEbook ? 'Modifiez les détails de l\'ebook' : 'Remplissez les détails du nouvel ebook'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Auteur</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pages">Nombre de pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    min="0"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publish_date">Date de publication</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Mots-clés (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="ex: finance, business, éducation"
                  />
                </div>
              </div>

              <div>
                <Label>Image de couverture</Label>
                {formData.cover_image_url && (
                  <div className="mb-2">
                    <img 
                      src={formData.cover_image_url} 
                      alt="Couverture actuelle" 
                      className="h-32 object-cover rounded"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      // Aperçu de l'image
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setFormData(prev => ({ ...prev, cover_image_url: e.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Fichier Ebook (PDF/EPUB)</Label>
                {formData.file_url && (
                  <div className="mb-2 text-sm text-gray-600">
                    Fichier actuel: {formData.file_url.split('/').pop()}
                  </div>
                )}
                <Input
                  type="file"
                  accept=".pdf,.epub"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEbookFile(file);
                      setFormData(prev => ({ 
                        ...prev, 
                        file_type: file.type,
                        file_size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
                      }));
                    }
                  }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Mettre en avant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                  />
                  <Label htmlFor="is_free">Gratuit</Label>
                </div>
              </div>

              {!formData.is_free && (
                <div>
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setDialogOpen(false);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : (editingEbook ? 'Mettre à jour' : 'Créer')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ebooks</p>
                <p className="text-2xl font-bold">{ebooks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À la une</p>
                <p className="text-2xl font-bold">{ebooks.filter(e => e.featured).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Téléchargements</p>
                <p className="text-2xl font-bold">{ebooks.reduce((sum, e) => sum + e.downloads, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold">{(ebooks.reduce((sum, e) => sum + e.rating, 0) / (ebooks.length || 1)).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des ebooks */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Ebooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-500">Couverture</th>
                    <th className="text-left p-4 font-medium text-gray-500">Titre</th>
                    <th className="text-left p-4 font-medium text-gray-500">Auteur</th>
                    <th className="text-left p-4 font-medium text-gray-500">Catégorie</th>
                    <th className="text-left p-4 font-medium text-gray-500">Téléchargements</th>
                    <th className="text-left p-4 font-medium text-gray-500">Note</th>
                    <th className="text-left p-4 font-medium text-gray-500">Statut</th>
                    <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ebooks.length > 0 ? (
                    ebooks.map((ebook) => (
                      <tr key={ebook.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <img
                            src={ebook.cover_image_url || '/placeholder.svg'}
                            alt={ebook.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{ebook.title}</div>
                          <div className="text-sm text-gray-500">{ebook.pages} pages</div>
                        </td>
                        <td className="p-4">{ebook.author}</td>
                        <td className="p-4">
                          <Badge variant="outline">{ebook.category}</Badge>
                        </td>
                        <td className="p-4">{ebook.downloads.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                            {ebook.rating.toFixed(1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {ebook.featured && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                À la une
                              </Badge>
                            )}
                            <Badge variant={ebook.is_free ? 'default' : 'outline'}>
                              {ebook.is_free ? 'Gratuit' : `${ebook.price} FCFA`}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFeatured(ebook.id, ebook.featured)}
                              title={ebook.featured ? 'Retirer des mises en avant' : 'Mettre en avant'}
                            >
                              <Star 
                                className={`h-4 w-4 ${ebook.featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(ebook)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(ebook.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-500">
                        Aucun ebook trouvé. Commencez par en ajouter un.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EbookManagement;