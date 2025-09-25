import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface ReferredUser {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at?: string;  // Rendre ce champ optionnel
  membership_tier?: string;
  is_verified: boolean;
  referral_code?: string;
}

interface ReferralData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  status: 'Active' | 'Pending';
  earnings: number;
  rewardType?: string;
  membershipTier?: string;
  isVerified: boolean;
  userDetails?: ReferredUser;
}

interface ReferrerData {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  phone?: string;
  created_at?: string;
  membership_tier?: string;
  is_verified?: boolean;
  referred_by?: string;
  referrer_affiliate_code?: string;
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
  referrer?: ReferrerData | null;
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

      // Récupérer d'abord le code de parrainage de l'utilisateur actuel
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      if (userError) throw userError;
      if (!currentUser?.referral_code) {
        throw new Error('Aucun code de parrainage trouvé pour cet utilisateur');
      }

      // Récupérer les utilisateurs qui ont été parrainés par l'utilisateur actuel
      console.log('Récupération des utilisateurs parrainés...');
      console.log('ID utilisateur actuel:', user.id);
      console.log('Code de parrainage actuel:', currentUser.referral_code);
      
      // Essayer d'abord avec referred_by (ID utilisateur)
      const { data: referredById, error: errorById } = await supabase
        .from('users')
        .select('*')
        .eq('referred_by', user.id);
      
      // Ensuite essayer avec referrer_affiliate_code (code de parrainage)
      const { data: referredByCode, error: errorByCode } = await supabase
        .from('users')
        .select('*')
        .eq('referrer_affiliate_code', currentUser.referral_code);
      
      console.log('Résultats par ID utilisateur:', referredById);
      console.log('Résultats par code de parrainage:', referredByCode);
      
      // Fusionner les résultats en supprimant les doublons
      const allReferred = [...(referredById || []), ...(referredByCode || [])].reduce<ReferrerData[]>((acc, current) => {
        const x = acc.find((item: ReferrerData) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      console.log('Utilisateurs parrainés trouvés:', allReferred);
      
      if (errorById) console.error('Erreur avec referred_by:', errorById);
      if (errorByCode) console.error('Erreur avec referrer_affiliate_code:', errorByCode);
      
      const referredUsers = allReferred.length > 0 ? allReferred : null;

      // Récupérer les informations du référent (si l'utilisateur a été parrainé)
      const { data: userData, error: currentUserError } = await supabase
        .from('users')
        .select('referred_by, referrer_affiliate_code, is_verified')
        .eq('id', user.id)
        .single();

      if (currentUserError) {
        console.error('Erreur lors de la récupération des informations du référent:', currentUserError);
        throw currentUserError;
      }

      let referrerData = null;
      
      // Vérifier d'abord referred_by (ID utilisateur)
      if (userData?.referred_by) {
        const { data: refData, error: refError } = await supabase
          .from('users')
          .select('id, full_name, email, phone, referral_code, created_at, is_verified')
          .eq('id', userData.referred_by)
          .maybeSingle();
          
        if (!refError && refData) {
          referrerData = refData;
        } else if (refError) {
          console.error('Erreur lors de la récupération du référent par ID:', refError);
        }
      } 
      // Si referred_by n'est pas défini, essayer avec referrer_affiliate_code
      else if (userData?.referrer_affiliate_code) {
        const { data: refData, error: refError } = await supabase
          .from('users')
          .select('id, full_name, email, phone, referral_code, created_at, is_verified')
          .eq('referral_code', userData.referrer_affiliate_code)
          .maybeSingle();
          
        if (!refError && refData) {
          referrerData = refData;
        } else if (refError) {
          console.error('Erreur lors de la récupération du référent par code:', refError);
        }
      }

      // Récupérer les données des commissions depuis la table affiliate_referrals
      const { data: referralCommissions, error: commissionsError } = await supabase
        .from('affiliate_referrals')
        .select('referred_id, status, commission_earned, created_at')
        .eq('referrer_id', user.id);

      if (commissionsError) throw commissionsError;

      // Créer un map pour un accès rapide aux commissions par ID d'utilisateur
      const commissionMap = new Map<
        string, 
        { status: 'Active' | 'Pending'; earnings: number; date: string }
      >(
        referralCommissions?.map(rc => [
          rc.referred_id,
          {
            status: rc.status === 'confirmed' ? 'Active' : 'Pending',
            earnings: rc.commission_earned || 0,
            date: new Date(rc.created_at).toLocaleDateString('fr-FR')
          }
        ]) || []
      );

      // Calculer les statistiques
      const activeReferrals = referredUsers?.filter(u => 
        commissionMap.get(u.id)?.status === 'Active'
      ).length || 0;
      
      const pendingReferrals = referredUsers?.filter(u => 
        commissionMap.get(u.id)?.status === 'Pending' || !commissionMap.has(u.id)
      ).length || 0;
      
      const totalEarnings = referralCommissions?.reduce(
        (sum, rc) => sum + (rc.commission_earned || 0), 0
      ) || 0;
      
      const pendingEarnings = referralCommissions?.filter(
        rc => rc.status !== 'confirmed'
      ).reduce((sum, rc) => sum + (rc.commission_earned || 0), 0) || 0;

      // Créer l'historique des parrainages
      const referralHistory: ReferralData[] = referredUsers?.map(user => {
        const commission = commissionMap.get(user.id);
        return {
          id: user.id,
          name: user.full_name || 'Utilisateur anonyme',
          email: user.email || '',
          phone: user.phone || null,
          date: commission?.date || (user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'),
          status: commission?.status || 'Pending',
          earnings: commission?.earnings || 0,
          membershipTier: user.membership_tier || 'Aucun',
          isVerified: user.is_verified || false,
          userDetails: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || null,
            created_at: user.created_at,
            membership_tier: user.membership_tier,
            is_verified: user.is_verified || false,
            referral_code: user.referral_code
          }
        };
      }) || [];

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