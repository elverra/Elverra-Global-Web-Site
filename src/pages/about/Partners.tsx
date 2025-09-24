import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';

interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  partnership_type: string;
  featured: boolean;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('business_partners')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setPartners(data || []);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // After loading, check if there are no partners
  if (!loading && partners.length === 0) {
    return (
      <Layout>
        <PremiumBanner 
          title="Our Partners" 
          description="Discover our trusted partners who support us in our mission."
        />
        <div className="container py-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">No partners available at the moment</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We are currently working on building new partnerships. Check back soon to discover our partners.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner 
        title="Our Partners" 
        description="Discover our trusted partners who support us in our mission."
      />
      
      <div className="container py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Link 
                key={partner.id} 
                to={`/partners/${partner.id}`}
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col border border-gray-100 dark:border-gray-700">
                  <div className="p-6 flex-1 flex flex-col items-center text-center">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name} 
                        className="h-24 w-auto mb-4 object-contain"
                      />
                    ) : (
                      <div className="h-24 w-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mb-4">
                        <span className="text-gray-400">{partner.name}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2">{partner.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {partner.description || 'No description available.'}
                    </p>
                    <div className="mt-auto w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        View details
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
