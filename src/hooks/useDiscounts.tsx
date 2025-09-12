import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { discountService } from '@/services/mockServices';
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
      // Use mock discount service
      const result = await discountService.getDiscounts();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch merchants');
      }
      
      // Apply client-side filtering (will be replaced with server-side filtering)
      let filteredData = result.data || [];
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((merchant: any) => 
          merchant.name?.toLowerCase().includes(searchLower) ||
          merchant.description?.toLowerCase().includes(searchLower) ||
          merchant.sector?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.sector && filters.sector !== 'all') {
        filteredData = filteredData.filter((merchant: any) => merchant.sector === filters.sector);
      }

      if (filters?.location && filters.location !== 'all') {
        filteredData = filteredData.filter((merchant: any) => 
          merchant.location?.toLowerCase().includes(filters.location?.toLowerCase())
        );
      }

      if (filters?.featured) {
        filteredData = filteredData.filter((merchant: any) => merchant.featured);
      }

      setMerchants(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch merchants');
      console.error('Error fetching merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedMerchants = async () => {
    await fetchMerchants({ featured: true });
  };

  const fetchSectors = async () => {
    try {
      // Use mock discount service
      const result = await discountService.getSectors();
      
      if (result.success) {
        setSectors(result.data || []);
      } else {
        console.log('No sectors found, using empty list');
        setSectors([]);
      }
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
      toast.error('Please login to claim discounts');
      return;
    }

    try {
      // Mock discount usage recording - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUsage: DiscountUsage = {
        id: `usage_${Date.now()}`,
        user_id: user.id,
        merchant_id: merchantId,
        discount_percentage: discountPercentage,
        amount_saved: amountSaved,
        used_at: new Date().toISOString()
      };
      
      setUsageHistory(prev => [newUsage, ...prev]);
      toast.success('Discount claimed successfully!');
    } catch (error) {
      console.error('Error recording discount usage:', error);
      toast.error('Failed to claim discount');
    }
  };

  const fetchUsageHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Mock usage history fetch - will be replaced with Supabase
      await new Promise(resolve => setTimeout(resolve, 600));
      setUsageHistory([]);
    } catch (error) {
      console.error('Error fetching usage history:', error);
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