import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Lock, 
  Upload,
  Plus,
  Loader2,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface EBook {
  id: string;
  title: string;
  description?: string;
  category: string;
  file_path: string;
  file_size?: number;
  thumbnail_url?: string;
  author?: string;
  published_date?: string;
  upload_date: string;
  download_count: number;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

const EBookLibrary = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<EBook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchEbooks(), fetchCategories()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEbooks = async () => {
    const mockResult = { data: [], error: null }; // TODO: Replace with API call
    const { data, error } = mockResult;

    if (error) throw error;
    setEbooks(data || []);
  };

  const fetchCategories = async () => {
    const mockResult = { data: [], error: null }; // TODO: Replace with API call
    const { data, error } = mockResult;

    if (error) throw error;
    setCategories(data || []);
  };

  const handlePreview = async (ebook: EBook) => {
    if (!user) {
      toast.error('Please login to preview books');
      navigate('/login');
      return;
    }

    try {
      const mockUrlResult = { data: { publicUrl: '/sample-ebook.pdf' } }; // TODO: Replace with API call
      const { data } = mockUrlResult;

      if (data?.publicUrl) {
        setPreviewUrl(data.publicUrl);
        setPreviewTitle(ebook.title);
        setShowPreview(true);
      } else {
        toast.error('Failed to load book preview');
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      toast.error('Failed to load book preview');
    }
  };

  const handleDownload = async (ebook: EBook) => {
    if (!user) {
      toast.error('Please login to download books');
      navigate('/login');
      return;
    }

    try {
      // Increment download count
      // TODO: API call - rpc('increment_ebook_downloads', { ebook_id: ebook.id });

      // Get download URL
      const mockDownloadResult = { data: { publicUrl: '/sample-download.pdf' } }; // TODO: Replace with API call
      const { data } = mockDownloadResult;

      if (data?.publicUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.publicUrl;
        link.download = `${ebook.title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Download started');
        
        // Update local state
        setEbooks(prev => prev.map(book => 
          book.id === ebook.id 
            ? { ...book, download_count: book.download_count + 1 }
            : book
        ));
      } else {
        toast.error('Failed to generate download link');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      toast.error('Failed to download book');
    }
  };

  const filteredEbooks = ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ebook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Show login required message for non-authenticated users
  if (!user) {
    return (
      <Layout>
        <PremiumBanner
          title="E-Book Library"
          description="Access our collection of educational and professional development books"
          backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          showBackButton
          backUrl="/about"
        />

        <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-12">
                  <Lock className="h-16 w-16 text-orange-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-orange-800 mb-4">Login Required</h2>
                  <p className="text-orange-700 mb-8">
                    Access to our E-Book Library is restricted to registered members only. 
                    Please login to read or download books from our collection.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => navigate('/login')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      size="lg"
                    >
                      Login to Access Library
                    </Button>
                    <p className="text-sm text-orange-600">
                      Don't have an account? <button 
                        onClick={() => navigate('/register')}
                        className="underline hover:no-underline"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <PremiumBanner
          title="E-Book Library"
          description="Access our collection of educational and professional development books"
          backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          showBackButton
          backUrl="/about"
        />
        <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading library...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title="E-Book Library"
        description="Access our collection of educational and professional development books"
        backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/about"
      >
        {isAdmin && (
          <div className="mt-6">
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Book
            </Button>
          </div>
        )}
      </PremiumBanner>

      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Search and Filter */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search books..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-600 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {filteredEbooks.length} books available
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {categories.map((category) => {
                const categoryCount = ebooks.filter(book => book.category === category.name).length;
                return (
                  <Card 
                    key={category.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCategory === category.name ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.name ? 'all' : category.name
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <p className="text-xs text-gray-500">{categoryCount} books</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Books Grid */}
            {filteredEbooks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No books found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search criteria' 
                      : 'No books available in the library yet'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEbooks.map((ebook) => (
                  <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {ebook.thumbnail_url ? (
                          <img
                            src={ebook.thumbnail_url}
                            alt={ebook.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500">PDF</span>
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-blue-500">
                          {ebook.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
                      {ebook.author && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {ebook.author}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {ebook.description && (
                        <CardDescription className="line-clamp-2 mb-3">
                          {ebook.description}
                        </CardDescription>
                      )}
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(ebook.file_size)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads:</span>
                          <span>{ebook.download_count}</span>
                        </div>
                        {ebook.published_date && (
                          <div className="flex justify-between">
                            <span>Published:</span>
                            <span>{formatDate(ebook.published_date)}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handlePreview(ebook)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleDownload(ebook)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-full border rounded"
                title={previewTitle}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Form Dialog - Admin Only */}
      {isAdmin && (
        <EBookUploadForm
          open={showUploadForm}
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            fetchEbooks();
          }}
          categories={categories}
        />
      )}
    </Layout>
  );
};

// Admin Upload Form Component
interface EBookUploadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

const EBookUploadForm = ({ open, onClose, onSuccess, categories }: EBookUploadFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    author: '',
    published_date: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('File size must be less than 50MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !formData.title || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileName = `${formData.category}/${Date.now()}_${formData.file.name}`;
      const mockUploadResult = { data: null, error: null }; // TODO: Replace with API call
      const { data: uploadData, error: uploadError } = mockUploadResult;

      if (uploadError) throw uploadError;

      // Create ebook record
      const mockEbookResult = { data: null, error: null }; // TODO: Replace with API call
      const { error: insertError } = mockEbookResult;

      if (insertError) throw insertError;

      toast.success('Book uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        author: '',
        published_date: '',
        file: null
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error uploading book:', error);
      toast.error('Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload New E-Book</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter book title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-md"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter book description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Published Date</label>
              <Input
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">PDF File *</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum file size: 50MB. Only PDF files are allowed.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Book
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EBookLibrary;