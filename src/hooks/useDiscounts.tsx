import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

export interface Merchant {
  id: string;
  name: string;
  sector: string;
  location: string;
  discount_percentage: number;
  description?: string;
  image_url?: string;
  rating?: number;
  website?: string;
  contact_phone?: string;
  contact_email?: string;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscountUsage {
  id: string;
  user_id: string;
  merchant_id: string;
  amount_saved?: number;
  discount_percentage?: number;
  used_at: string;
}

export const useDiscounts = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [sectors, setSectors] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = async (filters?: {
    search?: string;
    sector?: string;
    location?: string;
    featured?: boolean;
  }) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sector.ilike.%${filters.search}%`
        );
      }

      if (filters?.sector && filters.sector !== 'all') {
        query = query.eq('sector', filters.sector);
      }

      if (filters?.location && filters.location !== 'all') {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setMerchants([]);
        return;
      }

      setMerchants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
      console.error('Error fetching merchants:', err);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedMerchants = async () => {
    await fetchMerchants({ featured: true });
  };

  const fetchSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('sector')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching sectors:', error);
        setSectors([]);
        return;
      }
      
      // Get unique sectors
      const uniqueSectors = [...new Set(data?.map(item => item.sector).filter(Boolean))]
        .map((sector, index) => ({ id: `sector_${index}`, name: sector }));
      
      setSectors(uniqueSectors);
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setSectors([]);
    }
  };

  const getSectors = () => {
    return sectors;
  };

  const getLocations = () => {
    const uniqueLocations = [...new Set(merchants.map(m => m.location))];
    return uniqueLocations.sort();
  };

  useEffect(() => {
    fetchMerchants();
    fetchSectors();
  }, []);

  return { 
    merchants,
    sectors,
    loading, 
    error, 
    fetchMerchants,
    fetchSectors,
    getFeaturedMerchants,
    getSectors,
    getLocations
  };
};

export const useDiscountUsage = () => {
  const { user } = useAuth();
  const [usageHistory, setUsageHistory] = useState<DiscountUsage[]>([]);
  const [loading, setLoading] = useState(false);

  const recordDiscountUsage = async (merchantId: string, discountPercentage: number, amountSaved?: number) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour réclamer des remises');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discount_usage')
        .insert([{
          user_id: user.id,
          merchant_id: merchantId,
          discount_percentage: discountPercentage,
          amount_saved: amountSaved,
          used_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setUsageHistory(prev => [data, ...prev]);
      toast.success('Remise réclamée avec succès!');
    } catch (error) {
      console.error('Error recording discount usage:', error);
      toast.error('Échec de la réclamation de remise');
    }
  };

  const fetchUsageHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('discount_usage')
        .select(`
          *,
          merchant:merchant_id (
            name,
            sector
          )
        `)
        .eq('user_id', user.id)
        .order('used_at', { ascending: false });
        
      if (error) throw error;
      
      setUsageHistory(data || []);
    } catch (error) {
      console.error('Error fetching usage history:', error);
      setUsageHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSavings = () => {
    return usageHistory.reduce((total, usage) => total + (usage.amount_saved || 0), 0);
  };

  useEffect(() => {
    if (user) {
      fetchUsageHistory();
    }
  }, [user]);

  return {
    usageHistory,
    loading,
    recordDiscountUsage,
    fetchUsageHistory,
    getTotalSavings
  };
};