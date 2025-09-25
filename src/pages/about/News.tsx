
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featured_image_url: string;
  category: string;
  created_at: string;
  author: string;
  meta_description?: string;
  view_count?: number;
}

const News = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

 
  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNewsArticles(data || []);
      
      if (!data || data.length === 0) {
        setError('No news available at the moment.');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('No news available at the moment. Please check back later.');
      setNewsArticles([]);
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <Layout>
      <PremiumBanner
        title="Latest News"
        description="Stay updated with the latest developments, partnerships, and announcements from Elverra Global."
        backgroundImage="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        showBackButton
        backUrl="/about"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-8">Loading news articles...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {newsArticles.map((article) => (
                  <Link 
                    key={article.id} 
                    to={`/news/${article.slug}`}
                    className="block"
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={article.featured_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {article.category || 'News'}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(article.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                          {article.title}
                        </CardTitle>
                        <CardDescription>
                          {article.meta_description || article.excerpt || 'Read more...'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {article.author || 'Admin Team'}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="pointer-events-none group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            Read More
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default News;