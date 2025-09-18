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
}

const categories = [
  'Business & Finance',
  'Technology & Education', 
  'Agriculture & Environment',
  'Healthcare & Medicine',
  'Personal Development',
  'Legal & Governance'
];

const EbookManagement = () => {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    pages: 0,
    publish_date: '',
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

      if (error) {
        console.error('Supabase error:', error);
        setEbooks([]);
        return;
      }
      
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      setEbooks([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    if (!user) {
      toast.error('Vous devez être connecté pour téléverser des fichiers');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
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
    
    if (!user) {
      toast.error('Vous devez être connecté pour effectuer cette action');
      return;
    }

    setUploading(true);

    try {
      // Validation des champs requis
      if (!formData.title || !formData.author || !formData.category) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Vérification des fichiers
      if (!editingEbook && !ebookFile) {
        throw new Error('Veuillez sélectionner un fichier pour l\'ebook');
      }

      if (ebookFile && ebookFile.size > 50 * 1024 * 1024) { // 50MB max
        throw new Error('La taille du fichier ne doit pas dépasser 50MB');
      }

      let coverImageUrl = editingEbook?.cover_image_url || '';
      let fileUrl = editingEbook?.file_url || '';
      let fileSizeMb = editingEbook?.file_size_mb || 0;
      let fileType = editingEbook?.file_type || 'pdf';

      // Téléverser l'image de couverture si fournie
      if (coverFile) {
        const uploadedCoverUrl = await uploadFile(coverFile, 'covers');
        if (!uploadedCoverUrl) {
          throw new Error('Échec du téléversement de l\'image de couverture');
        }
        coverImageUrl = uploadedCoverUrl;
      }

      // Téléverser le fichier de l'ebook si fourni
      if (ebookFile) {
        const uploadedFileUrl = await uploadFile(ebookFile, 'files');
        if (!uploadedFileUrl) {
          throw new Error('Échec du téléversement du fichier de l\'ebook');
        }
        fileUrl = uploadedFileUrl;
        fileSizeMb = parseFloat((ebookFile.size / (1024 * 1024)).toFixed(2)); // Convertir en MB avec 2 décimales
        fileType = ebookFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      }

      const ebookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        category: formData.category,
        pages: Number(formData.pages) || 0,
        publish_date: formData.publish_date || new Date().toISOString().split('T')[0],
        cover_image_url: coverImageUrl,
        file_url: fileUrl,
        file_type: fileType,
        file_size_mb: fileSizeMb,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
          .slice(0, 10), // Limiter à 10 tags maximum
        featured: formData.featured,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : Math.max(0, Number(formData.price) || 0),
        updated_at: new Date().toISOString(),
        created_by: user.id
      };

      // Utiliser une transaction pour s'assurer que tout se passe bien
      const { data, error } = editingEbook 
        ? await supabase
            .from('ebooks')
            .update(ebookData)
            .eq('id', editingEbook.id)
            .select()
        : await supabase
            .from('ebooks')
            .insert([ebookData])
            .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Erreur lors de la ${editingEbook ? 'mise à jour' : 'création'} de l'ebook`);
      }

      if (!data || data.length === 0) {
        throw new Error('Aucune donnée retournée après la sauvegarde');
      }

      toast.success(`Ebook ${editingEbook ? 'mis à jour' : 'créé'} avec succès`);
      setDialogOpen(false);
      resetForm();
      await fetchEbooks();
    } catch (error) {
      console.error('Error saving ebook:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : `Erreur lors de la ${editingEbook ? 'mise à jour' : 'création'} de l'ebook`
      );
    } finally {
      setUploading(false);
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
      tags: ebook.tags.join(', '),
      featured: ebook.featured,
      is_free: ebook.is_free,
      price: ebook.price
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer un ebook');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ebook ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Vérifier d'abord si l'utilisateur a les droits de suppression
      const { data: ebook, error: fetchError } = await supabase
        .from('ebooks')
        .select('created_by')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Vérifier si l'utilisateur est l'auteur ou un administrateur
      const { data: userData } = await supabase.auth.getUser();
      const isAdmin = userData.user?.user_metadata?.role === 'admin';
      
      if (user.id !== ebook.created_by && !isAdmin) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer cet ebook');
      }

      // Supprimer d'abord les fichiers associés s'ils existent
      if (editingEbook?.cover_image_url) {
        const coverPath = editingEbook.cover_image_url.split('/').pop();
        if (coverPath) {
          await supabase.storage
            .from('ebooks')
            .remove([`covers/${coverPath}`]);
        }
      }

      if (editingEbook?.file_url) {
        const filePath = editingEbook.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('ebooks')
            .remove([`files/${filePath}`]);
        }
      }

      // Ensuite supprimer l'entrée de la base de données
      const { error: deleteError } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      toast.success('Ebook supprimé avec succès');
      await fetchEbooks();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ebook:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue lors de la suppression de l\'ebook'
      );
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    if (!user) {
      toast.error('Vous devez être connecté pour effectuer cette action');
      return;
    }

    try {
      // Vérifier les droits d'administration
      const { data: userData } = await supabase.auth.getUser();
      const isAdmin = userData.user?.user_metadata?.role === 'admin';
      
      if (!isAdmin) {
        throw new Error('Seuls les administrateurs peuvent mettre en avant des ebooks');
      }

      const { error } = await supabase
        .from('ebooks')
        .update({ 
          featured: !featured,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(
        `Ebook ${!featured ? 'mis en avant' : 'retiré des mises en avant'} avec succès`
      );
      await fetchEbooks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'ebook:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Échec de la mise à jour de l\'ebook'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      pages: 0,
      publish_date: '',
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
        <div className="text-lg">Loading ebooks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ebook Management</h1>
          <p className="text-gray-600">Manage your digital library</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ebook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEbook ? 'Edit Ebook' : 'Add New Ebook'}</DialogTitle>
              <DialogDescription id="dialog-description">
        This is a description of what this dialog does.
      </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
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
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publish_date">Publish Year</Label>
                  <Input
                    id="publish_date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Finance, Business, Education"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cover">Cover Image</Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <Label htmlFor="file">Ebook File (PDF/EPUB)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.epub"
                  onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                  />
                  <Label htmlFor="is_free">Free</Label>
                </div>
              </div>

              {!formData.is_free && (
                <div>
                  <Label htmlFor="price">Price (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingEbook ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-600">Featured</p>
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
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{(ebooks.reduce((sum, e) => sum + e.rating, 0) / ebooks.length || 0).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ebooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Ebooks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Cover</th>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Author</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Downloads</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ebooks.map((ebook) => (
                  <tr key={ebook.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={ebook.cover_image_url || '/placeholder.svg'}
                        alt={ebook.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{ebook.title}</p>
                        <p className="text-sm text-gray-600">{ebook.pages} pages</p>
                      </div>
                    </td>
                    <td className="p-4">{ebook.author}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{ebook.category}</Badge>
                    </td>
                    <td className="p-4">{ebook.downloads.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {ebook.rating}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {ebook.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                        {ebook.is_free ? (
                          <Badge className="bg-green-100 text-green-800">Free</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">{ebook.price} FCFA</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(ebook.id, ebook.featured)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ebook)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ebook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EbookManagement;
