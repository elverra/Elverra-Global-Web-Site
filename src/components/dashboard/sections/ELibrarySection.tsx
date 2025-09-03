import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Library,
  Book,
  Search,
  Download,
  Star,
  BookOpen,
  Filter,
  Calendar,
  User,
  FileText,
  Headphones,
  Video,
  Eye
} from 'lucide-react';

const ELibrarySection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  const hasAccess = membership?.tier === 'premium' || membership?.tier === 'elite';

  // Mock books data
  const [books] = useState([
    {
      id: 1,
      title: 'Introduction to Programming',
      author: 'Dr. Amadou Diallo',
      category: 'Technology',
      format: 'PDF',
      pages: 320,
      rating: 4.5,
      reviews: 24,
      downloadCount: 156,
      cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=300&fit=crop',
      description: 'Learn the fundamentals of programming with practical examples',
      language: 'French',
      publishedDate: '2023',
      size: '2.3 MB',
      downloaded: false
    },
    {
      id: 2,
      title: 'Business Management in Africa',
      author: 'Fatou Kone',
      category: 'Business',
      format: 'PDF',
      pages: 280,
      rating: 4.3,
      reviews: 18,
      downloadCount: 89,
      cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop',
      description: 'Strategic approaches to business management in the African context',
      language: 'English',
      publishedDate: '2023',
      size: '1.8 MB',
      downloaded: true
    },
    {
      id: 3,
      title: 'History of Mali',
      author: 'Ibrahim Traore',
      category: 'History',
      format: 'EPUB',
      pages: 450,
      rating: 4.7,
      reviews: 32,
      downloadCount: 203,
      cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop',
      description: 'Comprehensive history of Mali from ancient times to present',
      language: 'French',
      publishedDate: '2022',
      size: '3.1 MB',
      downloaded: false
    },
    {
      id: 4,
      title: 'French Language Course',
      author: 'Marie Dubois',
      category: 'Education',
      format: 'Audio',
      pages: 0,
      rating: 4.6,
      reviews: 41,
      downloadCount: 178,
      cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&h=300&fit=crop',
      description: 'Complete French language learning course with audio exercises',
      language: 'Multilingual',
      publishedDate: '2023',
      size: '120 MB',
      downloaded: false
    }
  ]);

  // Mock reading history
  const [readingHistory] = useState([
    {
      id: 2,
      title: 'Business Management in Africa',
      author: 'Fatou Kone',
      lastRead: '2024-01-20',
      progress: 75,
      totalPages: 280,
      currentPage: 210
    },
    {
      id: 1,
      title: 'Introduction to Programming',
      author: 'Dr. Amadou Diallo',
      lastRead: '2024-01-15',
      progress: 45,
      totalPages: 320,
      currentPage: 144
    }
  ]);

  // Mock reviews
  const [myReviews] = useState([
    {
      id: 1,
      bookId: 2,
      bookTitle: 'Business Management in Africa',
      rating: 5,
      review: 'Excellent book with practical insights for African businesses.',
      date: '2024-01-18'
    }
  ]);

  const categories = ['all', 'Technology', 'Business', 'History', 'Education', 'Science', 'Literature', 'Health'];
  const formats = ['all', 'PDF', 'EPUB', 'Audio', 'Video'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesFormat = selectedFormat === 'all' || book.format === selectedFormat;
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const downloadBook = (bookId: number) => {
    if (!hasAccess) {
      alert('E-Library access requires Premium or Elite membership. Please upgrade to download books.');
      return;
    }
    alert('Download started! Check your downloads folder.');
  };

  const rateBook = (bookId: number) => {
    alert('Rating submitted! Thank you for your feedback.');
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'EPUB':
        return <Book className="h-4 w-4" />;
      case 'Audio':
        return <Headphones className="h-4 w-4" />;
      case 'Video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">E-Library</h2>
          <Badge className="bg-orange-100 text-orange-800">Premium Feature</Badge>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <Library className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upgrade to Access E-Library</h3>
            <p className="text-gray-600 mb-6">
              Access thousands of books, audiobooks, and educational materials with Premium or Elite membership. 
              Expand your knowledge with our curated collection of digital content.
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Upgrade Membership
            </Button>
          </CardContent>
        </Card>

        {/* Preview of Available Books */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Books (Preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.slice(0, 4).map((book) => (
                <div key={book.id} className="border rounded-lg p-4 opacity-60">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{book.category}</Badge>
                    <div className="flex items-center gap-1">
                      {getFormatIcon(book.format)}
                      <span className="text-xs">{book.format}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">E-Library</h2>
        <Badge className="bg-green-100 text-green-800">
          <BookOpen className="h-3 w-3 mr-1" />
          Premium Access
        </Badge>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Books</TabsTrigger>
          <TabsTrigger value="my-library">My Library</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search books by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(format => (
                        <SelectItem key={format} value={format}>
                          {format === 'all' ? 'All Formats' : format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedFormat('all');
                  }}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge className="bg-blue-600">{book.format}</Badge>
                    {book.downloaded && (
                      <Badge className="bg-green-600">Downloaded</Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  <p className="text-gray-700 text-xs mb-3 line-clamp-2">{book.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-600">{book.rating} ({book.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{book.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span>{book.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{book.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span>{book.downloadCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => downloadBook(book.id)}
                      disabled={book.downloaded}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {book.downloaded ? 'Downloaded' : 'Download'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rateBook(book.id)}>
                      <Star className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Downloaded Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books.filter(book => book.downloaded).map((book) => (
                  <div key={book.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold">{book.title}</h4>
                        <p className="text-gray-600 text-sm">{book.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{book.category}</Badge>
                          <div className="flex items-center gap-1">
                            {getFormatIcon(book.format)}
                            <span className="text-xs">{book.format}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {books.filter(book => book.downloaded).length === 0 && (
                  <div className="text-center py-8">
                    <Library className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No books in your library yet</p>
                    <p className="text-sm text-gray-400">Start browsing to download books to your library</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {readingHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.author}</p>
                        <p className="text-xs text-gray-500">Last read: {item.lastRead}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.progress}% Complete</p>
                        <p className="text-xs text-gray-500">
                          Page {item.currentPage} of {item.totalPages}
                        </p>
                      </div>
                    </div>
                    <Progress value={item.progress} className="mb-3" />
                    <Button size="sm">Continue Reading</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Book Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{review.bookTitle}</h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.review}</p>
                    <p className="text-xs text-gray-500">Reviewed on: {review.date}</p>
                  </div>
                ))}
                {myReviews.length === 0 && (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400">Start reading and reviewing books to share your thoughts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ELibrarySection;