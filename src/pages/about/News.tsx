
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const News = () => {
  const navigate = useNavigate();
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;

      if (error) throw error;

      const cmsNews = (data as any[])?.map((page: any) => ({
        id: page.id,
        title: page.title,
        excerpt: page.meta_description || page.content.substring(0, 200) + '...',
        date: page.created_at.split('T')[0],
        author: 'Admin Team',
        category: 'News',
        image: page.featured_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      })) || [];

      // If no CMS news, show static news
      if (cmsNews.length === 0) {
        setNewsArticles(getStaticNews());
      } else {
        setNewsArticles(cmsNews);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsArticles(getStaticNews());
    } finally {
      setLoading(false);
    }
  };

  const getStaticNews = () => [
    {
      id: 1,
      slug: "elverra-global-expands-three-new-countries",
      title: "Elverra Global has opened its doors in Mali",
      excerpt: "We're excited to announce our expansion into Burkina Faso, Niger, and Guinea, bringing our client benefits to even more communities.",
      date: "2024-03-15",
      author: "Admin Team",
      category: "Expansion",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      slug: "new-partnership-regional-development-bank",
      title: "New Partnership with Regional Development Bank",
      excerpt: "Strategic partnership enables enhanced financial services and micro-lending opportunities for our clients across our network.",
      date: "2024-03-10",
      author: "Partnership Team",
      category: "Partnership",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      slug: "digital-card-launch-instant-access-benefits",
      title: "Digital Card Launch: Instant Access to Benefits",
      excerpt: "Introducing our new digital client cards with QR code technology for instant verification and seamless benefit access.",
      date: "2024-03-05",
      author: "Technology Team",
      category: "Innovation",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      slug: "zenika-card-program-financial-inclusion",
      title: "ZENIKA Card Program Reaches 100,000 Active Users",
      excerpt: "Our flagship ZENIKA card program has achieved a major milestone, providing financial services to over 100,000 clients.",
      date: "2024-08-10",
      author: "Program Team",
      category: "Milestone",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 5,
      slug: "community-job-training-program-expansion",
      title: "Community Job Training Program Expands to 10 New Cities",
      excerpt: "Our skills development and job placement program is expanding to reach more young professionals seeking employment opportunities.",
      date: "2024-07-22",
      author: "Training Team",
      category: "Education",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 6,
      slug: "o-secours-emergency-assistance-milestone",
      title: "Ô Secours Program Provides Emergency Aid to 50,000 Families",
      excerpt: "Our emergency financial assistance program has reached a significant milestone, helping families in crisis across our client network.",
      date: "2024-07-15",
      author: "Emergency Team",
      category: "Community Impact",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const handleReadMore = (article: any) => {
    // Use slug if available, otherwise fall back to ID
    const identifier = article.slug || article.id;
    navigate(`/news/${identifier}`);
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
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {newsArticles.map((article) => {
                  const identifier = article.slug || article.id;
                  return (
                    <Link key={article.id} to={`/news/${identifier}`} className="block">
                      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group h-full">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-purple-100 text-purple-800">
                              {article.category}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(article.date).toLocaleDateString()}
                            </div>
                          </div>
                          <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">{article.title}</CardTitle>
                          <CardDescription>{article.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-1" />
                              {article.author}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="pointer-events-none group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors"
                            >
                              Read More
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default News;
