import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { getActiveSubscription } from '@/utils/subscriptionService';

// Global cache to prevent multiple API calls
let membershipCache: { [userId: string]: Membership | null } = {};
let fetchPromises: { [userId: string]: Promise<Membership | null> } = {};

export interface Membership {
  id: string;
  user_id: string;
  tier: 'essential' | 'premium' | 'elite' | 'child';
  is_active: boolean;
  start_date: string;
  expiry_date: string;
  physical_card_requested: boolean;
  member_id?: string;
}

export interface MembershipAccess {
  hasActiveMembership: boolean;
  membershipTier: 'essential' | 'premium' | 'elite' | 'child' | null;
  canAccessDiscounts: boolean;
  canAccessJobs: boolean;
  canAccessAffiliates: boolean;
  canAccessOSecours: boolean;
  canAccessShop: boolean;
  canPostJobs: boolean;
  canPostProducts: boolean;
  maxJobApplications: number;
  maxProductListings: number;
  discountLevel: number; // 5%, 10%, or 20%
}

export const useMembership = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.id) {
      fetchMembership();
    } else {
      setMembership(null);
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-fetches

  const fetchMembership = async () => {
    if (!user) return;

    // Check cache first
    if (membershipCache[user.id] !== undefined) {
      setMembership(membershipCache[user.id]);
      setLoading(false);
      return;
    }

    // Check if there's already a fetch in progress for this user
    const existingPromise = fetchPromises[user.id];
    if (existingPromise) {
      try {
        const cachedResult = await existingPromise;
        setMembership(cachedResult);
        setLoading(false);
        return;
      } catch (err) {
        // Continue with new fetch
        // Clean up failed promise
        delete fetchPromises[user.id];
      }
    }

    try {
      setLoading(true);
      
      const fetchPromise = (async () => {
        try {
          // Use subscription service for direct Supabase query
          const data = await getActiveSubscription(user.id);

          const membership = data ? {
            id: data.id,
            user_id: data.user_id,
            tier: data.plan,
            is_active: data.status === 'active',
            start_date: data.start_date,
            expiry_date: data.end_date,
            physical_card_requested: false,
            member_id: data.id
          } : null;

          membershipCache[user.id] = membership;
          return membership;
        } catch (error) {
          console.error('Error fetching membership:', error);
          // Don't cache errors, allow retry
          return null;
        }
      })();

      fetchPromises[user.id] = fetchPromise;
      
      const result = await fetchPromise;
      setMembership(result);
      
      // Clean up the promise after completion
      delete fetchPromises[user.id];
      
    } catch (err) {
      console.error('Error in fetchMembership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
      membershipCache[user.id] = null;
      delete fetchPromises[user.id];
    } finally {
      setLoading(false);
    }
  };

  const getMembershipAccess = (): MembershipAccess => {
    // Check if membership record exists and is active
    const hasActiveMembership = !!membership && membership.is_active;
    const membershipTier = hasActiveMembership ? membership.tier : null;

    if (!hasActiveMembership) {
      return {
        hasActiveMembership: false,
        membershipTier: null,
        canAccessDiscounts: false,
        canAccessJobs: false,
        canAccessAffiliates: false,
        canAccessOSecours: false,
        canAccessShop: false,
        canPostJobs: false,
        canPostProducts: false,
        maxJobApplications: 0,
        maxProductListings: 0,
        discountLevel: 0
      };
    }

    // Define access levels based on membership tier
    switch (membershipTier) {
      case 'essential':
        return {
          hasActiveMembership: true,
          membershipTier: 'essential',
          canAccessDiscounts: false,
          canAccessJobs: true,
          canAccessAffiliates: false,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: false,
          canPostProducts: true,
          maxJobApplications: 5,
          maxProductListings: 3,
          discountLevel: 0
        };
      case 'premium':
        return {
          hasActiveMembership: true,
          membershipTier: 'premium',
          canAccessDiscounts: false,
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: 15,
          maxProductListings: 10,
          discountLevel: 0
        };
      case 'elite':
        return {
          hasActiveMembership: true,
          membershipTier: 'elite',
          canAccessDiscounts: false,
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: -1, // Unlimited
          maxProductListings: -1, // Unlimited
          discountLevel: 0
        };
      case 'child':
        return {
          hasActiveMembership: true,
          membershipTier: 'child',
          canAccessDiscounts: false,
          canAccessJobs: false,
          canAccessAffiliates: false,
          canAccessOSecours: false,
          canAccessShop: false,
          canPostJobs: false,
          canPostProducts: false,
          maxJobApplications: 0,
          maxProductListings: 0,
          discountLevel: 0
        };
      default:
        // Si le tier n'est pas reconnu, considérer comme pas d'abonnement
        return {
          hasActiveMembership: false,
          membershipTier: null,
          canAccessDiscounts: false,
          canAccessJobs: false,
          canAccessAffiliates: false,
          canAccessOSecours: false,
          canAccessShop: false,
          canPostJobs: false,
          canPostProducts: false,
          maxJobApplications: 0,
          maxProductListings: 0,
          discountLevel: 0
        };
    }
  };

  const requiresMembership = (feature: keyof MembershipAccess): boolean => {
    const access = getMembershipAccess();
    return access[feature] as boolean;
  };

  const getMembershipTierName = (): string => {
    if (!membership) return 'No Membership';
    return membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1);
  };

  const isExpiringSoon = (): boolean => {
    if (!membership) return false;
    const expiryDate = new Date(membership.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  };

  const clearCache = () => {
    if (user?.id) {
      delete membershipCache[user.id];
      delete fetchPromises[user.id];
    }
  };

  const refetch = async () => {
    clearCache();
    await fetchMembership();
  };

  return {
    membership,
    loading,
    error,
    fetchMembership,
    refetch,
    clearCache,
    getMembershipAccess,
    requiresMembership,
    getMembershipTierName,
    isExpiringSoon
  };
};