import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('NewsDetail mounted with ID:', id);
    if (id) {
      fetchArticle();
    } else {
      console.log('No ID found, redirecting to news');
      navigate('/about/news');
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      // First try to get from CMS pages
      const response = await fetch(`/api/cms-pages/${id}`);
      console.log('CMS response status:', response.status);
      
      if (response.ok) {
        const cmsData = await response.json();
        console.log('CMS data received:', cmsData);
        setArticle({
          ...cmsData,
          author: 'Admin Team', // Default author
          category: 'News', // Default category
          image: cmsData.featured_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        });
        
        // Increment view count
        try {
          await fetch(`/api/cms-pages/${id}/views`, { method: 'POST' });
        } catch (error) {
          // View count increment is non-critical
        }
      } else {
        console.log('CMS not found, trying static news');
        // Fallback to static news if not found in CMS
        const staticNews = getStaticNews();
        // Try to find by slug first, then by ID
        const staticArticle = staticNews.find(news => 
          news.slug === id || news.id.toString() === id
        );
        console.log('Static article found:', staticArticle);
        if (staticArticle) {
          setArticle(staticArticle);
          return; // Exit early for static articles
        } else {
          console.log('No article found');
          throw new Error('Article not found');
        }
      }
    } catch (error: any) {
      console.error('Error fetching article:', error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const getStaticNews = () => [
    {
      id: 1,
      slug: "elverra-global-expands-three-new-countries",
      title: "Elverra Global Expands to Three New Countries",
      meta_description: "Elverra Global announces expansion into Burkina Faso, Niger, and Guinea, bringing client benefits to new communities.",
      content: `
        <p>We're excited to announce a major milestone in Elverra Global's expansion journey. Our client benefits and services are now available in three new countries: Burkina Faso, Niger, and Guinea.</p>
        
        <h3>What This Means for Our Clients</h3>
        <p>This expansion represents our commitment to bringing financial inclusion and community benefits to more communities. Clients in these new countries will have access to:</p>
        <ul>
          <li>Ô Secours emergency assistance services</li>
          <li>Discount networks with local merchants</li>
          <li>Financial services and micro-lending opportunities</li>
          <li>Community support programs</li>
          <li>ZENIKA card benefits and privileges</li>
        </ul>
        
        <h3>Local Partnerships</h3>
        <p>We've established partnerships with local businesses and service providers in each country to ensure our clients receive the best possible benefits. Our team has been working closely with local communities to understand their specific needs and tailor our services accordingly.</p>
        
        <h3>What's Next</h3>
        <p>This expansion is just the beginning. We have plans to enter additional markets across the region in the coming months, always with the goal of supporting local communities and providing valuable services to our clients.</p>
      `,
      created_at: "2024-03-15T00:00:00Z",
      author: "Admin Team",
      category: "Expansion",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 245
    },
    {
      id: 2,
      slug: "new-partnership-regional-development-bank",
      title: "New Partnership with Regional Development Bank",
      meta_description: "Strategic partnership enhances financial services and micro-lending opportunities for clients across our network.",
      content: `
        <p>Elverra Global is proud to announce a strategic partnership with the Regional Development Bank that will significantly enhance our financial services and micro-lending opportunities for clients across our network.</p>
        
        <h3>Partnership Benefits</h3>
        <p>This collaboration will enable us to offer:</p>
        <ul>
          <li>Enhanced micro-lending programs with better terms</li>
          <li>Financial literacy training programs</li>
          <li>Business development support for entrepreneurs</li>
          <li>Improved payment systems and digital wallet services</li>
          <li>Preferential rates for ZENIKA cardholders</li>
        </ul>
        
        <h3>Supporting Local Entrepreneurs</h3>
        <p>Through this partnership, we'll be able to provide targeted support for small business owners and entrepreneurs in our client communities. The bank's expertise in regional development, combined with our community-focused approach, creates opportunities for sustainable economic growth.</p>
        
        <h3>Digital Innovation</h3>
        <p>The partnership also includes joint initiatives to develop digital financial solutions tailored to the needs of our client communities. We're working on mobile payment systems and digital banking services that will make financial services more accessible to our clients.</p>
        
        <h3>Implementation Timeline</h3>
        <p>The new services will be rolled out in phases over the next six months, starting with our largest client markets and expanding to all regions by the end of 2024.</p>
      `,
      created_at: "2024-03-10T00:00:00Z",
      author: "Partnership Team",
      category: "Partnership",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 189
    },
    {
      id: 3,
      slug: "digital-card-launch-instant-access-benefits",
      title: "Digital Card Launch: Instant Access to Benefits",
      meta_description: "New digital client cards feature QR code technology for instant verification and seamless benefit access.",
      content: `
        <p>We're thrilled to introduce our new digital client cards, featuring cutting-edge QR code technology that provides instant verification and seamless access to all Elverra Global benefits.</p>
        
        <h3>Key Features</h3>
        <p>Our digital cards include:</p>
        <ul>
          <li>QR code for instant merchant verification</li>
          <li>Real-time benefit tracking</li>
          <li>Secure digital wallet integration</li>
          <li>Offline access capabilities</li>
          <li>Multi-language support (French, English, local languages)</li>
          <li>Biometric security options</li>
        </ul>
        
        <h3>How It Works</h3>
        <p>Clients can access their digital card through our mobile app or web portal. The QR code can be scanned by participating merchants to instantly verify client status and apply relevant discounts or benefits.</p>
        
        <h3>Enhanced Security</h3>
        <p>The digital cards feature advanced security measures including:</p>
        <ul>
          <li>Encrypted QR codes that change periodically</li>
          <li>Biometric authentication options</li>
          <li>Real-time fraud detection</li>
          <li>Instant card suspension capabilities</li>
          <li>Secure cloud backup and sync</li>
        </ul>
        
        <h3>Environmental Impact</h3>
        <p>By moving to digital cards, we're also reducing our environmental footprint. This initiative aligns with our commitment to sustainability and responsible business practices.</p>
        
        <h3>Rollout Schedule</h3>
        <p>Digital cards are now available to all clients. Existing physical cards will remain valid, but we encourage all clients to make the switch to enjoy the enhanced features and convenience of our digital solution.</p>
      `,
      created_at: "2024-03-05T00:00:00Z",
      author: "Technology Team",
      category: "Innovation",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 312
    },
    {
      id: 4,
      slug: "zenika-card-program-financial-inclusion",
      title: "ZENIKA Card Program Reaches 100,000 Active Users",
      meta_description: "Our flagship ZENIKA card program achieves major milestone, providing financial services to over 100,000 clients.",
      content: `
        <p>We're proud to announce that our flagship ZENIKA card program has reached a significant milestone: 100,000 active users across our client network.</p>
        
        <h3>Program Impact</h3>
        <p>Since its launch, the ZENIKA card program has delivered impressive results:</p>
        <ul>
          <li>100,000+ active cardholders</li>
          <li>$50M+ in transactions processed</li>
          <li>25,000+ participating merchants</li>
          <li>Average savings of 15% per transaction for cardholders</li>
          <li>99.8% customer satisfaction rating</li>
        </ul>
        
        <h3>Financial Inclusion Success</h3>
        <p>The ZENIKA card has become a powerful tool for financial inclusion, providing banking services to previously unbanked populations. Our cardholders have gained access to:</p>
        <ul>
          <li>Digital payment capabilities</li>
          <li>Savings account features</li>
          <li>Micro-lending opportunities</li>
          <li>Insurance products</li>
          <li>Investment options</li>
        </ul>
        
        <h3>Community Stories</h3>
        <p>The real success of the ZENIKA card program lies in the stories of our clients. From small business owners who've expanded their operations to students who've funded their education, the card has been a catalyst for positive change.</p>
        
        <h3>Looking Ahead</h3>
        <p>As we celebrate this milestone, we're already working on the next phase of the program. Upcoming features include cryptocurrency support, international remittances, and enhanced business tools for entrepreneurs.</p>
      `,
      created_at: "2024-08-10T00:00:00Z",
      author: "Program Team",
      category: "Milestone",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 156
    },
    {
      id: 5,
      slug: "community-job-training-program-expansion",
      title: "Community Job Training Program Expands to 10 New Cities",
      meta_description: "Skills development and job placement program expands to reach more young professionals seeking employment opportunities.",
      content: `
        <p>Our Community Job Training Program is expanding its reach with the addition of 10 new cities, bringing our total coverage to 25 cities across our client network.</p>
        
        <h3>Program Growth</h3>
        <p>The expansion includes new training centers in:</p>
        <ul>
          <li>Koudougou, Burkina Faso</li>
          <li>Bobo-Dioulasso, Burkina Faso</li>
          <li>Niamey, Niger</li>
          <li>Maradi, Niger</li>
          <li>Conakry, Guinea</li>
          <li>Kankan, Guinea</li>
          <li>Tamale, Ghana</li>
          <li>Kumasi, Ghana</li>
          <li>San, Mali</li>
          <li>Mopti, Mali</li>
        </ul>
        
        <h3>Training Opportunities</h3>
        <p>Each new center will offer comprehensive training in:</p>
        <ul>
          <li>Digital marketing and e-commerce</li>
          <li>Computer programming and web development</li>
          <li>Financial services and banking</li>
          <li>Healthcare support services</li>
          <li>Agricultural technology</li>
          <li>Renewable energy systems</li>
        </ul>
        
        <h3>Success Metrics</h3>
        <p>Our existing centers have achieved remarkable results:</p>
        <ul>
          <li>85% job placement rate within 3 months</li>
          <li>Average income increase of 200% for graduates</li>
          <li>1,500+ businesses started by program alumni</li>
          <li>95% program completion rate</li>
        </ul>
        
        <h3>Application Process</h3>
        <p>Applications for the new training centers are now open. Interested candidates can apply through our website or visit any of our existing service centers for assistance with the application process.</p>
      `,
      created_at: "2024-07-22T00:00:00Z",
      author: "Training Team",
      category: "Education",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 98
    },
    {
      id: 6,
      slug: "o-secours-emergency-assistance-milestone",
      title: "Ô Secours Program Provides Emergency Aid to 50,000 Families",
      meta_description: "Our emergency financial assistance program reaches significant milestone, helping families in crisis across our client network.",
      content: `
        <p>The Ô Secours emergency financial assistance program has reached a significant milestone, providing critical support to over 50,000 families across our client network during times of crisis.</p>
        
        <h3>Program Impact</h3>
        <p>Since its inception, Ô Secours has provided:</p>
        <ul>
          <li>Emergency assistance to 50,000+ families</li>
          <li>$15M+ in emergency funding disbursed</li>
          <li>Average response time of 6 hours</li>
          <li>Support for medical emergencies, natural disasters, and family crises</li>
          <li>24/7 availability across all client markets</li>
        </ul>
        
        <h3>Types of Emergency Support</h3>
        <p>The Ô Secours program covers a wide range of emergency situations:</p>
        <ul>
          <li>Medical emergencies and hospital bills</li>
          <li>Natural disaster relief and rebuilding</li>
          <li>Family crisis support (death, disability, job loss)</li>
          <li>Educational emergency funding</li>
          <li>Small business crisis intervention</li>
          <li>Transportation emergencies</li>
        </ul>
        
        <h3>Success Stories</h3>
        <p>Among the thousands of families we've helped, several stories stand out:</p>
        <ul>
          <li>A single mother who received emergency medical funding for her child's surgery</li>
          <li>A farming family whose crops were saved after flooding with emergency replanting funds</li>
          <li>A small business owner who kept his shop running during a family crisis</li>
          <li>A student who continued her education after her family faced financial hardship</li>
        </ul>
        
        <h3>How to Access Support</h3>
        <p>Clients can access Ô Secours support through multiple channels:</p>
        <ul>
          <li>24/7 emergency hotline</li>
          <li>Mobile app emergency request</li>
          <li>Local service centers</li>
          <li>Community representatives</li>
          <li>Online emergency portal</li>
        </ul>
        
        <h3>Looking Forward</h3>
        <p>We're expanding the Ô Secours program to include preventive support services, financial planning assistance, and partnerships with local healthcare and education providers to better serve our client communities.</p>
      `,
      created_at: "2024-07-15T00:00:00Z",
      author: "Emergency Team",
      category: "Community Impact",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      view_count: 203
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.meta_description || article.content.substring(0, 200) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
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
            <Button onClick={() => navigate('/about/news')}>
              Back to News
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title={article.title}
        description={article.meta_description || `Published on ${new Date(article.created_at).toLocaleDateString()}`}
        backgroundImage={article.image}
        showBackButton
        backUrl="/about/news"
      />

      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {/* Article Header */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      {article.category || 'News'}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {article.author}
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

                {/* Article Image */}
                {article.image && (
                  <div className="mb-8 rounded-lg overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: article.content.replace(/\n/g, '<br>') 
                    }} 
                  />
                </div>

                {/* Article Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Views: {article.view_count || 0}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/about/news')}
                      >
                        More News
                      </Button>
                      <Button onClick={handleShare}>
                        Share Article
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetail;