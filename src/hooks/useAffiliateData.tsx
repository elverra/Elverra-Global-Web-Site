import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  const { data: affiliateData, isLoading: loading, error, refetch: refreshData } = useQuery({
    queryKey: ['affiliate-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch affiliate data from Supabase
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch referral history
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user:referred_user_id (
            full_name,
            email
          )
        `)
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Calculate stats
      const activeReferrals = referrals?.filter(r => r.status === 'active').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalEarnings = referrals?.reduce((sum, r) => sum + (r.commission_earned || 0), 0) || 0;
      const pendingEarnings = referrals?.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.commission_earned || 0), 0) || 0;

      const referralHistory: ReferralData[] = referrals?.map(r => ({
        id: r.id,
        name: r.referred_user?.full_name || 'Utilisateur anonyme',
        date: new Date(r.created_at).toLocaleDateString('fr-FR'),
        status: r.status === 'active' ? 'Active' : 'Pending',
        earnings: r.commission_earned || 0,
        rewardType: r.reward_type
      })) || [];

      const affiliateStats: AffiliateStats = {
        referralCode: affiliateProfile?.referral_code || `REF${user.id.substring(0, 8).toUpperCase()}`,
        totalReferrals: activeReferrals,
        pendingReferrals,
        referralTarget: affiliateProfile?.referral_target || 10,
        totalEarnings,
        pendingEarnings,
        referralHistory,
        progress: affiliateProfile?.referral_target ? (activeReferrals / affiliateProfile.referral_target) * 100 : 0,
        creditPoints: affiliateProfile?.credit_points || 0,
        commissions: totalEarnings
      };

      return affiliateStats;
    },
    enabled: !!user?.id,
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