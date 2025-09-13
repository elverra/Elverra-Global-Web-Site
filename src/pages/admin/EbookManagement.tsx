import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BookOpen, Plus, Edit, Trash2, Upload, Eye, Download, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

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
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('ebooks')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let coverImageUrl = editingEbook?.cover_image_url || '';
      let fileUrl = editingEbook?.file_url || '';
      let fileSizeMb = editingEbook?.file_size_mb || 0;
      let fileType = editingEbook?.file_type || 'pdf';

      // Upload cover image if provided
      if (coverFile) {
        const uploadedCoverUrl = await uploadFile(coverFile, 'covers');
        if (uploadedCoverUrl) coverImageUrl = uploadedCoverUrl;
      }

      // Upload ebook file if provided
      if (ebookFile) {
        const uploadedFileUrl = await uploadFile(ebookFile, 'files');
        if (uploadedFileUrl) {
          fileUrl = uploadedFileUrl;
          fileSizeMb = ebookFile.size / (1024 * 1024); // Convert to MB
          fileType = ebookFile.name.split('.').pop()?.toLowerCase() || 'pdf';
        }
      }

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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        featured: formData.featured,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
        updated_at: new Date().toISOString()
      };

      if (editingEbook) {
        // Update existing ebook
        const { error } = await supabase
          .from('ebooks')
          .update(ebookData)
          .eq('id', editingEbook.id);

        if (error) throw error;
        toast.success('Ebook updated successfully');
      } else {
        // Create new ebook
        const { error } = await supabase
          .from('ebooks')
          .insert([{ ...ebookData, created_by: (await supabase.auth.getUser()).data.user?.id }]);

        if (error) throw error;
        toast.success('Ebook created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchEbooks();
    } catch (error) {
      console.error('Error saving ebook:', error);
      toast.error('Failed to save ebook');
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
    if (!confirm('Are you sure you want to delete this ebook?')) return;

    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Ebook deleted successfully');
      fetchEbooks();
    } catch (error) {
      console.error('Error deleting ebook:', error);
      toast.error('Failed to delete ebook');
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('ebooks')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Ebook ${!featured ? 'featured' : 'unfeatured'} successfully`);
      fetchEbooks();
    } catch (error) {
      console.error('Error updating ebook:', error);
      toast.error('Failed to update ebook');
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
