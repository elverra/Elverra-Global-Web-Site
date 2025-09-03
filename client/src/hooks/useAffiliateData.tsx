import { useQuery } from '@tanstack/react-query';

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
    queryKey: ['/api/affiliate-dashboard', userId],
    queryFn: async () => {
      if (!userId) {
        // Return dummy data if no user is logged in for demo purposes
        const dummyData: AffiliateStats = {
          referralCode: `ELV${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          totalReferrals: 7,
          pendingReferrals: 2,
          referralTarget: 10,
          totalEarnings: 175000,
          pendingEarnings: 50000,
          referralHistory: [
            { id: '1', name: 'Aminata Diallo', date: '2025-01-10', status: 'Active', earnings: 25000 },
            { id: '2', name: 'Ibrahim Konaté', date: '2025-01-08', status: 'Active', earnings: 25000 },
            { id: '3', name: 'Fatou Ndiaye', date: '2025-01-05', status: 'Pending', earnings: 25000 },
            { id: '4', name: 'Moussa Traoré', date: '2024-12-28', status: 'Active', earnings: 25000 },
            { id: '5', name: 'Aïsha Ba', date: '2024-12-25', status: 'Active', earnings: 25000 },
            { id: '6', name: 'Sekou Camara', date: '2024-12-20', status: 'Pending', earnings: 25000 },
            { id: '7', name: 'Mariam Keita', date: '2024-12-18', status: 'Active', earnings: 25000 }
          ],
          progress: 70,
          creditPoints: 7000,
          commissions: 168000
        };
        return dummyData;
      }
      
      const response = await fetch(`/api/affiliate-dashboard/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch affiliate data');
      }
      
      const data = await response.json();
      
      // Add pendingReferrals for compatibility
      const pendingReferrals = data.referralHistory.filter((r: any) => r.status === 'Pending').length;
      
      return {
        ...data,
        pendingReferrals
      } as AffiliateStats;
    },
    retry: false, // Don't retry on error
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  return { 
    affiliateData, 
    loading, 
    error: error ? (error as Error).message : null, 
    refreshData 
  };
};