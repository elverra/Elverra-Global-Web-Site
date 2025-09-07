// types.ts

// User-related types
export interface User {
    id: string;
    email: string;
    fullName: string;
    password?: string;
    phone?: string | null;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    referralCode?: string | null;
    referredBy?: string | null;
    membershipTier?: 'basic' | 'premium' | 'elite';
    isMerchant?: boolean;
    merchantApprovalStatus?: 'pending' | 'approved' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface UserProfile {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface UserRole {
    userId: string;
    role: 'admin' | 'member' | 'merchant';
  }
  
  // Merchant-related types
  export interface Merchant {
    id: string;
    businessName: string;
    businessType: string;
    sectorId: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    discountPercentage: number;
    description: string;
    logoUrl: string | null;
    rating: number;
    featured: boolean;
    isActive: boolean;
  }
  
  export interface AdminMerchant {
    id: string;
    name: string;
    businessType: string;
    sector_id: string;
    discount_percentage: number;
    location: string;
    contact_phone: string;
    contact_email: string;
    description: string;
    website: string;
    logo_url: string | null;
    rating: number;
    is_active: boolean;
    featured: boolean;
  }
  
  export interface Sector {
    id: string;
    name: string;
    description: string;
    is_active?: boolean;
  }
  
  // Discount-related types
  export interface Discount {
    id: string;
    title: string;
    merchant: string;
    sector: string;
    discount_percentage: number;
    description: string;
    location: string;
    image_url: string;
    rating: number;
    featured: boolean;
    website?: string;
    phone?: string;
    email?: string;
  }
  
  export interface AdminDiscount {
    id: string;
    title: string;
    description: string;
    merchantId: string;
    merchantName: string;
    sectorId: string;
    sectorName: string;
    discountPercentage: number;
    minOrderAmount: number;
    maxDiscountAmount: number | null;
    validFrom: string;
    validUntil: string | null;
    usageLimit: number | null;
    usageCount: number;
    isFeatured: boolean;
    isActive: boolean;
    termsAndConditions: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Payment-related types
  export interface PaymentAttempt {
    id: string;
    userId: string;
    amount: string;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'orange_money' | 'sama_money';
    currency: string;
    transactionId?: string | null;
    metadata?: Record<string, any> | null;
    processedAt: Date;
    updatedAt?: Date;
  }
  
  export interface MembershipPayment {
    id: string;
    userId: string;
    amount: string;
    membershipTier: 'basic' | 'premium' | 'elite';
    paymentReference: string;
    paymentType: 'initial' | 'renewal';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
  }
  
  // Job-related types
  export interface Job {
    id: string;
    title: string;
    description: string;
    location: string;
    salary?: string | null;
    company: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface JobApplication {
    id: string;
    jobId: string;
    userId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt?: Date;
  }
  
  // Product-related types
  export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    merchantId: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }
  
  // Loan-related types
  export interface LoanApplication {
    id: string;
    userId: string;
    amount: number;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt?: Date;
  }
  
  // CMS-related types
  export interface CmsPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  // Affiliate and Referral types
  export interface Referral {
    id: string;
    referrerId: string;
    referredUserId: string;
    referralCode: string;
    referralType: 'merchant' | 'member';
    status: 'pending' | 'active';
    createdAt?: Date;
  }
  
  export interface AffiliateReward {
    id: string;
    referralId: string;
    referrerId: string;
    rewardType: 'credit_points' | 'commission';
    creditPointsAwarded?: number | null;
    commissionAmount?: number | null;
    createdAt: Date;
  }
  
  export interface AffiliateDashboard {
    referralCode: string;
    totalReferrals: number;
    referralTarget: number;
    progress: number;
    totalEarnings: number;
    pendingEarnings: number;
    referralHistory: Array<{
      id: string;
      name: string;
      date: string;
      status: 'Active' | 'Pending';
      earnings: number;
      rewardType: string;
    }>;
    creditPoints: number;
    commissions: number;
  }
  
  // Membership types
  export interface Membership {
    id: string;
    user_id: string;
    tier: 'basic' | 'premium' | 'elite';
    is_active: boolean;
    start_date: string;
    expiry_date: string;
    physical_card_requested: boolean;
    member_id: string;
  }
  
  // Agent types
  export interface Agent {
    id: string;
    userId: string;
    commissionRate: number;
    totalCommissions: number;
    createdAt: Date;
    updatedAt?: Date;
  }
  
  // File/Asset types
  export interface FileAsset {
    url: string;
    name: string;
    success: boolean;
  }
  
  // Payment Gateway types
  export interface PaymentGateway {
    id: string;
    name: string;
    type: string;
    description: string;
    isActive: boolean;
    config: {
      supportedCurrencies: string[];
      environment: 'test' | 'production';
    };
    fees: {
      percentage: number;
      fixed: number;
    };
    icon: string;
    status: 'active' | 'inactive';
  }
  
  export interface PaymentGatewayLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    gatewayId: string;
    transactionId: string | null;
    details: {
      responseTime: number;
      statusCode: number;
    };
  }