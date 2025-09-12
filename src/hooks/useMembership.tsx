import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { membershipService } from '@/services/mockServices';

// Global cache to prevent multiple API calls
let membershipCache: { [userId: string]: Membership | null } = {};
let fetchPromises: { [userId: string]: Promise<Membership | null> } = {};

export interface Membership {
  id: string;
  user_id: string;
  tier: 'essential' | 'premium' | 'elite';
  is_active: boolean;
  start_date: string;
  expiry_date: string;
  physical_card_requested: boolean;
  member_id?: string;
}

export interface MembershipAccess {
  hasActiveMembership: boolean;
  membershipTier: 'essential' | 'premium' | 'elite' | null;
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
        // Continue with new fetch if cached promise failed
        delete fetchPromises[user.id];
      }
    }

    try {
      setLoading(true);
      
      // Create and store the fetch promise using mock service
      const fetchPromise = membershipService.getMembership(user.id)
        .then(async (result) => {
          if (result.success) {
            membershipCache[user.id] = result.data;
            return result.data;
          } else {
            membershipCache[user.id] = null;
            return null;
          }
        });

      fetchPromises[user.id] = fetchPromise;
      
      const result = await fetchPromise;
      setMembership(result);
      
      // Clean up the promise after completion
      delete fetchPromises[user.id];
      
    } catch (err) {
      console.error('Error in fetchMembership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
      console.error('Error fetching membership:', err);
      // Clean up failed promise
      delete fetchPromises[user.id];
    } finally {
      setLoading(false);
    }
  };

  const getMembershipAccess = (): MembershipAccess => {
    // Check if user has a valid membership tier (not null/undefined)
    const userTier = user?.membershipTier;
    const hasValidTier = userTier && ['essential', 'premium', 'elite'].includes(userTier);
    
    // Also check if membership record exists and is active
    const hasActiveMembership = hasValidTier && (!!membership && membership.is_active);
    const membershipTier = hasValidTier ? userTier as 'essential' | 'premium' | 'elite' : null;

    if (!hasActiveMembership || !hasValidTier) {
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
          canAccessDiscounts: true,
          canAccessJobs: true,
          canAccessAffiliates: false, // Limited access
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: false, // Limited access
          canPostProducts: true,
          maxJobApplications: 5,
          maxProductListings: 3,
          discountLevel: 5
        };
      case 'premium':
        return {
          hasActiveMembership: true,
          membershipTier: 'premium',
          canAccessDiscounts: true,
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: 15,
          maxProductListings: 10,
          discountLevel: 10
        };
      case 'elite':
        return {
          hasActiveMembership: true,
          membershipTier: 'elite',
          canAccessDiscounts: true,
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: -1, // Unlimited
          maxProductListings: -1, // Unlimited
          discountLevel: 20
        };
      default:
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