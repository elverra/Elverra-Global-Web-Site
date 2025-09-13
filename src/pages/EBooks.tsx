import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Star, Clock, Users, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
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
  "All Categories",
  "Business & Finance", 
  "Technology & Education",
  "Agriculture & Environment",
  "Healthcare & Medicine",
  "Personal Development",
  "Legal & Governance"
];

const EBooks = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReaders: 0,
    totalDownloads: 0,
    averageRating: 0
  });

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setEbooks([]);
        setStats({
          totalBooks: 0,
          totalReaders: 0,
          totalDownloads: 0,
          averageRating: 0
        });
        return;
      }
      
      const ebooksData = data || [];
      setEbooks(ebooksData);
      
      // Calculate stats
      const totalDownloads = ebooksData.reduce((sum, book) => sum + book.downloads, 0);
      const averageRating = ebooksData.length > 0 
        ? ebooksData.reduce((sum, book) => sum + book.rating, 0) / ebooksData.length 
        : 0;
      
      setStats({
        totalBooks: ebooksData.length,
        totalReaders: totalDownloads,
        totalDownloads,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching ebooks:', error);
      toast.error('Erreur lors du chargement des e-books');
      setEbooks([]);
      setStats({
        totalBooks: 0,
        totalReaders: 0,
        totalDownloads: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = ebooks.filter(book => {
    const matchesCategory = selectedCategory === "All Categories" || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDownload = async (book: Ebook) => {
    try {
      // Update download count
      const { error } = await supabase
        .from('ebooks')
        .update({ downloads: book.downloads + 1 })
        .eq('id', book.id);

      if (error) throw error;

      // Trigger download
      if (book.file_url) {
        window.open(book.file_url, '_blank');
        toast.success(`Downloading "${book.title}" by ${book.author}`);
        
        // Refresh data to show updated download count
        fetchEbooks();
      } else {
        toast.error('Download link not available');
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      toast.error('Failed to download book');
    }
  };

  const handleReadNow = (book: Ebook) => {
    if (book.file_url) {
      window.open(book.file_url, '_blank');
      toast.success(`Opening "${book.title}" for reading`);
    } else {
      toast.error('Reading link not available');
    }
  };

  return (
    <Layout>
      <PremiumBanner
        title="Free Online Library"
        description="Access our extensive collection of e-books covering business, technology, agriculture, and professional development. All books are free for Elverra Global clients."
        backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Library Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-600 mb-2">{stats.totalBooks}</h3>
                  <p className="text-gray-600">Available Books</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">{stats.totalReaders.toLocaleString()}+</h3>
                  <p className="text-gray-600">Active Readers</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Download className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">{stats.totalDownloads.toLocaleString()}+</h3>
                  <p className="text-gray-600">Downloads</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-yellow-600 mb-2">{stats.averageRating.toFixed(1)}</h3>
                  <p className="text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Search books, authors, or topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Books Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredBooks.filter(book => book.featured).map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img
                          src={book.cover_image_url || '/placeholder.svg'}
                          alt={book.title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {book.category}
                          </Badge>
                          {book.featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h3>
                        <p className="text-gray-600 mb-2">by {book.author}</p>
                        <p className="text-gray-700 mb-4 line-clamp-3">{book.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {book.pages} pages
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {book.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            {book.downloads.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleReadNow(book)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Read Now
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDownload(book)}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Books Grid */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Books</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={book.cover_image_url || '/placeholder.svg'}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800">
                          {book.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{book.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {book.rating}
                        </div>
                        <div>{book.pages} pages</div>
                        <div>{book.downloads.toLocaleString()} downloads</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleReadNow(book)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          Read Now
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={() => handleDownload(book)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <Card className="mt-16 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-white" />
                <h2 className="text-3xl font-bold mb-4">Start Your Learning Journey</h2>
                <p className="text-xl mb-6 max-w-2xl mx-auto">
                  Join thousands of Elverra Global clients who are advancing their skills with our free digital library. 
                  New books added monthly!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => toast.success("Welcome to our digital library!")}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explore All Books
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EBooks;