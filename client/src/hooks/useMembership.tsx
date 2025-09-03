import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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
    if (user) {
      fetchMembership();
    } else {
      setMembership(null);
      setLoading(false);
    }
  }, [user]);

  const fetchMembership = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch membership from API
      const response = await fetch(`/api/memberships/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setMembership(data);
      } else if (response.status === 404) {
        // No membership found
        setMembership(null);
      } else {
        throw new Error('Failed to fetch membership');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
      console.error('Error fetching membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipAccess = (): MembershipAccess => {
    const hasActiveMembership = !!membership && membership.is_active;
    const membershipTier = membership?.tier || null;

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

  return {
    membership,
    loading,
    error,
    fetchMembership,
    getMembershipAccess,
    requiresMembership,
    getMembershipTierName,
    isExpiringSoon
  };
};