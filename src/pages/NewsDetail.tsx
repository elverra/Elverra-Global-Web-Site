import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RichTextRenderer from '@/components/RichTextRenderer';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any;
  featured_image_url: string;
  author: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    } else {
      navigate('/about/news', { replace: true });
    }
  }, [slug, navigate]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      
      // Récupérer l'article par son slug
      const { data: articleData, error: articleError } = await supabase
        .from('news')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .single();

      if (articleError) throw articleError;
      if (!articleData) {
        throw new Error('Article not found');
      }

      // Incrémenter le compteur de vues
      await supabase
        .from('news')
        .update({ view_count: (articleData.view_count || 0) + 1 })
        .eq('id', articleData.id);

      setArticle(articleData);

      // Récupérer des articles connexes (même catégorie, exclure l'article actuel)
      const { data: relatedData, error: relatedError } = await supabase
        .from('news')
        .select('*')
        .eq('category', articleData.category)
        .neq('id', articleData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!relatedError && relatedData) {
        setRelatedArticles(relatedData);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Error',
        description: 'Failed to load article. Please try again later.',
        variant: 'destructive',
      });
      navigate('/about/news', { replace: true });
    } finally {
      setLoading(false);
    }
  };


 

  const handleShare = async () => {
    const shareData = {
      title: article?.title || '',
      text: article?.meta_description || article?.excerpt || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Article link copied to clipboard',
      });
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">Loading article...</div>
        </div>
      </Layout>
    );
  }


  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <Button onClick={() => navigate('/about/news')}>Back to News</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    if (!article) return null;
    
    if (typeof article.content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: article.content }} className="prose max-w-none" />;
    }
    
    // Si le contenu est un objet JSON (provenant de TipTap)
    if (article.content && article.content.type === 'doc') {
      return <RichTextRenderer content={article.content} />;
    }
    
    return <div className="text-gray-500 italic">Aucun contenu disponible</div>;
  };

  return (
    <Layout>
      <PremiumBanner
        title={article.title}
        description={article.meta_description || `Published on ${new Date(article.created_at).toLocaleDateString()}`}
        backgroundImage={article.featured_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
        showBackButton
        backUrl="/about/news"
      />

      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg overflow-hidden">
              {/* En-tête de l'article */}
              <div className="p-6 border-b">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Badge className="bg-purple-100 text-purple-800">
                    {article.category || 'News'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    {article.author || 'Admin Team'}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    👁️ {article.view_count || 0} views
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/about/news')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to News
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Image de l'article */}
              {article.featured_image_url && (
                <div className="w-full h-64 md:h-96 bg-gray-100 overflow-hidden">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Contenu de l'article */}
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  {renderContent()}
                </div>

                {/* Mots-clés */}
                {article.meta_keywords && article.meta_keywords.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.meta_keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Articles connexes */}
                {relatedArticles.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-6">Related Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedArticles.map((related) => (
                        <Link
                          key={related.id}
                          to={`/news/${related.slug}`}
                          className="block group"
                        >
                          <Card className="h-full hover:shadow-md transition-shadow">
                            {related.featured_image_url && (
                              <div className="h-40 overflow-hidden">
                                <img
                                  src={related.featured_image_url}
                                  alt={related.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h4 className="font-medium group-hover:text-purple-600 transition-colors">
                                {related.title}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {related.excerpt || related.meta_description}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetail;