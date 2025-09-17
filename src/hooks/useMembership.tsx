import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

// Global cache to prevent multiple API calls
let membershipCache: { [userId: string]: Membership | null } = {};
let fetchPromises: { [userId: string]: Promise<Membership | null> } = {};

// Global function to clear all cache (useful for debugging)
(window as any).clearMembershipCache = () => {
  membershipCache = {};
  fetchPromises = {};
  console.log('Membership cache cleared');
};

export interface Membership {
  id: string;
  user_id: string;
  tier: 'essential' | 'premium' | 'elite' | 'child';
  is_active: boolean;
  start_date: string;
  expiry_date: string | null;
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
          // Get all active subscriptions for the user (child + adult)
          const { data: subscriptions, error } = await supabase
            .from('subscriptions')
            .select('id, user_id, product_id, status, start_date, end_date, is_child')
            .eq('user_id', user.id)
            .eq('status', 'active');

          if (error) throw error;

          if (!subscriptions || subscriptions.length === 0) {
            // Fallback: Check user's membership_tier directly from users table
            const { data: userData } = await supabase
              .from('users')
              .select('membership_tier')
              .eq('id', user.id)
              .maybeSingle();
            
            if (userData?.membership_tier && userData.membership_tier !== 'none') {
              // Create a fallback membership object
              const fallbackMembership = {
                id: `fallback-${user.id}`,
                user_id: user.id,
                tier: userData.membership_tier as 'essential' | 'premium' | 'elite' | 'child',
                is_active: true,
                start_date: new Date().toISOString(),
                expiry_date: null,
                physical_card_requested: false,
                member_id: user.id,
                hasChildCard: userData.membership_tier === 'child',
                hasAdultCard: userData.membership_tier !== 'child'
              } as any;
              
              console.log('Using fallback membership from users table:', fallbackMembership);
              membershipCache[user.id] = fallbackMembership;
              return fallbackMembership;
            }
            
            membershipCache[user.id] = null;
            return null;
          }

          // Find child subscription
          const childSub = subscriptions.find(s => s.is_child === true);
          
          // Find adult subscription (prefer active, else any non-child)
          const adultSub = subscriptions.find(s => s.is_child !== true);

          // If we have an adult subscription, use that as primary membership
          // If only child, use child as primary
          const primarySub = adultSub || childSub;
          
          if (!primarySub) {
            membershipCache[user.id] = null;
            return null;
          }

          // Infer tier from primary subscription
          let inferredTier: 'essential' | 'premium' | 'elite' | 'child' = 'essential';
          if (primarySub.is_child) {
            inferredTier = 'child';
          } else {
            // Fetch product to infer adult tier by name
            const { data: product } = await supabase
              .from('membership_products')
              .select('name')
              .eq('id', primarySub.product_id)
              .maybeSingle();
            const n = (product?.name || '').toLowerCase();
            inferredTier = n.includes('elite') ? 'elite' : n.includes('premium') ? 'premium' : 'essential';
          }

          const membership = {
            id: primarySub.id,
            user_id: primarySub.user_id,
            tier: inferredTier,
            is_active: true,
            start_date: primarySub.start_date,
            expiry_date: primarySub.end_date,
            physical_card_requested: false,
            member_id: primarySub.id,
            // Store info about multiple subscriptions
            hasChildCard: !!childSub,
            hasAdultCard: !!adultSub
          } as any;

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
    
    // Check for multiple cards (child + adult)
    const hasChildCard = !!(membership as any)?.hasChildCard;
    const hasAdultCard = !!(membership as any)?.hasAdultCard;

    // Debug logging
    console.log('Membership Debug:', {
      membership,
      hasActiveMembership,
      membershipTier,
      hasChildCard,
      hasAdultCard
    });

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

    // If user has adult card, use adult permissions regardless of primary tier
    // If only child card, use child permissions
    const effectiveTier = hasAdultCard ? (membershipTier === 'child' ? 'essential' : membershipTier) : membershipTier;

    // Define access levels based on effective tier
    switch (effectiveTier) {
      case 'essential':
        return {
          hasActiveMembership: true,
          membershipTier: effectiveTier,
          canAccessDiscounts: true, // Essential members can access basic discounts
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: -1,
          maxProductListings: -1,
          discountLevel: 5 // 5% discount level
        };
      case 'premium':
        return {
          hasActiveMembership: true,
          membershipTier: effectiveTier,
          canAccessDiscounts: true, // Premium members can access discounts
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: -1,
          maxProductListings: -1,
          discountLevel: 10 // 10% discount level
        };
      case 'elite':
        return {
          hasActiveMembership: true,
          membershipTier: effectiveTier,
          canAccessDiscounts: true, // Elite members can access all discounts
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: -1, // Unlimited
          maxProductListings: -1, // Unlimited
          discountLevel: 20 // 20% discount level
        };
      case 'child':
        return {
          hasActiveMembership: true,
          membershipTier: effectiveTier,
          canAccessDiscounts: true,
          canAccessJobs: true,
          canAccessAffiliates: true,
          canAccessOSecours: true,
          canAccessShop: true,
          canPostJobs: true,
          canPostProducts: true,
          maxJobApplications: 0,
          maxProductListings: 0,
          discountLevel: 0
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
    if (!membership || !membership.expiry_date) return false;
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