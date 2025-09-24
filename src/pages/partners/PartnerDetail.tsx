import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';

interface Partner {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  partnership_type: string;
  created_at: string;
  featured: boolean;
  is_active: boolean;
}

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { data, error } = await supabase
          .from('business_partners')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setPartner(data);
      } catch (error) {
        console.error('Error fetching partner:', error);
        navigate('/partners', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPartner();
    } else {
      navigate('/partners', { replace: true });
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <PremiumBanner 
          title="Loading partner..." 
          description="Please wait while we load the information."
        />
        <div className="container py-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to partners
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!partner) {
    return (
      <Layout>
        <PremiumBanner 
          title="Partner not found" 
          description="The partner you are looking for does not exist or has been removed."
        />
        <div className="container py-12 text-center">
          <Button asChild>
            <Link to="/partners">Back to partners</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner 
        title={partner.name} 
        description="Discover the details of our partner"
      />
      
      <div className="container py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to partners
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              {partner.logo_url && (
                <img 
                  src={partner.logo_url} 
                  alt={partner.name} 
                  className="h-20 w-auto max-w-[200px] object-contain mr-6"
                />
              )}
              <h1 className="text-3xl font-bold">{partner.name}</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
                {partner.description || 'No description available.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {partner.contact_email && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a 
                        href={`mailto:${partner.contact_email}`} 
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {partner.contact_email}
                      </a>
                    </div>
                  </div>
                )}
                
                {partner.contact_phone && (
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a 
                        href={`tel:${partner.contact_phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {partner.contact_phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {partner.website && (
                  <div className="flex items-start">
                    <Globe className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        Visit website <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Partnership type</p>
                    <p className="capitalize">{partner.partnership_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p>{new Date(partner.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={partner.featured ? "default" : "secondary"}>
                    {partner.featured ? "Featured" : "Standard"}
                  </Badge>
                </div>
              </div>
              
              {partner.website && (
                <Button asChild className="w-full mt-6">
                  <a 
                    href={partner.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
