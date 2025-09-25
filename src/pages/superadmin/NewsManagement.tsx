import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ImageUpload } from '@/components/ImageUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

interface NewsArticle {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featured_image_url: string;
  author_id?: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  view_count: number;
  created_at?: string;
  updated_at?: string;
}

export default function NewsManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    slug: '',
    excerpt: '',
    content: { type: 'doc', content: [] },
    featured_image_url: '',
    author_id: user?.id || '',
    category: 'News',
    is_published: false,
    published_at: null,
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    view_count: 0
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getJSON()
      }));
    },
  });

  useEffect(() => {
    if (editor && currentArticle) {
      editor.commands.setContent(currentArticle.content);
    }
    if (user?.id) {
      setFormData(prev => ({ ...prev, author_id: user.id }));
    }
  }, [currentArticle, editor, user]);

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({ title: 'Error', description: 'Failed to load articles', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title' && !currentArticle) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug, meta_title: value }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news/${fileName}`;
      if (file.size > 12 * 1024 * 1024) throw new Error('File size must not exceed 2MB');

      const { error: uploadError } = await supabase.storage.from('news-images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('news-images').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const imageUrl = await handleImageUpload(file);
        if (imageUrl && editor) editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch {
        toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.id) {
      toast({ title: "Error", description: "You must be logged in to create or edit an article.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const articleData = {
        ...formData,
        author_id: user.id,
        published_at: formData.is_published ? new Date().toISOString() : null,
        content: editor?.getJSON() || formData.content
      };

      if (!articleData.title || !articleData.content) {
        toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
        return;
      }

      let data, error;
      if (currentArticle?.id) {
        const { data: updatedData, error: updateError } = await supabase.from('news')
          .update({ ...articleData, updated_at: new Date().toISOString() })
          .eq('id', currentArticle.id)
          .select()
          .single();
        data = updatedData; error = updateError;
      } else {
        const { data: createdData, error: createError } = await supabase.from('news')
          .insert([articleData])
          .select()
          .single();
        data = createdData; error = createError;
      }
      if (error) throw error;

      toast({ title: 'Success', description: `Article ${currentArticle ? 'updated' : 'created'} successfully` });
      resetForm(); fetchArticles(); setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleEdit = (article: NewsArticle) => {
    setCurrentArticle(article);
    setFormData({ ...article, author_id: article.author_id || user?.id || '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Article deleted successfully' });
      fetchArticles();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete article', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', excerpt: '', content: { type: 'doc', content: [] },
      featured_image_url: '', author_id: user?.id || '', category: 'News',
      is_published: false, published_at: null, meta_title: '', meta_description: '',
      meta_keywords: [], view_count: 0
    });
    setCurrentArticle(null);
    editor?.commands.setContent({ type: 'doc', content: [] });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsDialogOpen(open);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length > 0 ? articles.map(article => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell><Badge variant="outline">{article.category}</Badge></TableCell>
                  <TableCell>
                    {article.is_published ? <Badge className="bg-green-100 text-green-800">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                  </TableCell>
                  <TableCell>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US') : '-'}</TableCell>
                  <TableCell>{article.view_count}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/news/${article.slug}`, '_blank')}><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(article)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => article.id && handleDelete(article.id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No articles found. Create your first article to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentArticle ? 'Edit Article' : 'New Article'}</DialogTitle>
            <DialogDescription>{currentArticle ? 'Edit the article details below.' : 'Fill in the details below to create a new article.'}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Article title" required />
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="article-title" required />
                  <p className="text-xs text-gray-500 mt-1">URL version of the title (no spaces, use hyphens)</p>
                </div>

                {/* Excerpt */}
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleInputChange} placeholder="A short summary of the article" rows={3} />
                  <p className="text-xs text-gray-500 mt-1">A short summary of your article (max 300 characters)</p>
                </div>

                {/* Content */}
                <div>
                  <Label>Content *</Label>
                  <div className="border rounded-md">
                    <div className="border-b p-2 flex flex-wrap gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-gray-200' : ''}>B</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-gray-200' : ''}>I</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}>H2</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-gray-200' : ''}>•</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'bg-gray-200' : ''}>1.</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={handleAddImage}><ImageIcon className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => { const url = window.prompt('Enter URL'); if (url) editor?.chain().focus().setLink({ href: url }).run(); }}>🔗</Button>
                    </div>
                    <div className="p-4 min-h-[300px]">
                      <EditorContent editor={editor} className="prose max-w-none" />
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h3 className="font-medium">SEO Settings</h3>
                  <div>
                    <Label htmlFor="meta_title">SEO Title</Label>
                    <Input id="meta_title" name="meta_title" value={formData.meta_title} onChange={handleInputChange} placeholder="Title for search engines" />
                    <p className="text-xs text-gray-500 mt-1">Displayed in search results (leave empty to use the article title)</p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description">SEO Description</Label>
                    <Textarea id="meta_description" name="meta_description" value={formData.meta_description} onChange={handleInputChange} placeholder="Description for search engines" rows={3} />
                    <p className="text-xs text-gray-500 mt-1">Displayed in search results (leave empty to use the excerpt)</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div>
                  <Label>Featured Image</Label>
                  <div className="mt-2">
                    {formData.featured_image_url ? (
                      <div className="relative group">
                        <img src={formData.featured_image_url} alt="Featured" className="w-full h-48 object-cover rounded-md" />
                        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <ImageUpload onUpload={async (file: File) => { const url = await handleImageUpload(file); if (url) setFormData(prev => ({ ...prev, featured_image_url: url })); return url || ''; }}>
                          <div className="space-y-2">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                          </div>
                        </ImageUpload>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} placeholder="Ex: News, Events" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_published">Publish</Label>
                    <Switch id="is_published" checked={formData.is_published} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked, published_at: checked ? (prev.published_at || new Date().toISOString()) : null }))} />
                  </div>
                  {formData.is_published && (
                    <div className="mt-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.published_at && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.published_at ? format(new Date(formData.published_at), "PPP", { locale: fr }) : <span>Choose a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.published_at ? new Date(formData.published_at) : undefined}
                            onSelect={(date) => { if (date) setFormData(prev => ({ ...prev, published_at: date.toISOString() })); }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <div className="text-sm space-y-2">
                    <p className="font-medium">{formData.title || 'Article title'}</p>
                    <p className="text-gray-600 line-clamp-2">{formData.excerpt || 'A preview of your article will appear here...'}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}><Save className="h-4 w-4 mr-2" />{loading ? 'Saving...' : currentArticle ? 'Update' : 'Publish'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
