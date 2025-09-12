// Removed unused useState import
import { useQuery } from '@tanstack/react-query';
import { affiliateService } from '@/services/mockServices';

interface ReferralData {
  id: string;
  name: string;
  date: string;
  status: 'Active' | 'Pending';
  earnings: number;
  rewardType?: string;
}

interface AffiliateStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals?: number;
  referralTarget: number;
  totalEarnings: number;
  pendingEarnings: number;
  referralHistory: ReferralData[];
  progress: number;
  creditPoints?: number;
  commissions?: number;
}

export const useAffiliateData = () => {
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userId = currentUser.id;

  const { data: affiliateData, isLoading: loading, error, refetch: refreshData } = useQuery({
    queryKey: ['affiliate-dashboard', userId],
    queryFn: async () => {
      const result = await affiliateService.getAffiliateData(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch affiliate data');
      }
      
      return result.data as AffiliateStats;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return { 
    affiliateData, 
    loading, 
    error: error ? (error as Error).message : null, 
    refreshData 
  };
};