// Types for Ô Secours emergency services
export interface SecoursSubscription {
  id: string;
  user_id: string;
  subscription_type: 'auto' | 'cata_catanis' | 'school_fees' | 'motors' | 'telephone';
  token_balance: number;
  token_value: number;
  rescue_value: number;
  is_active: boolean;
  subscription_date: string;
  last_token_purchase_date?: string;
  created_at: string;
  updated_at: string;
}

// Token Balance interface for components
export interface TokenBalance {
  tokenId: string;
  balance: number;
  usedThisMonth: number;
  monthlyLimit: number;
  remainingBalance: number;
}

// Token Purchase interface for transaction history
export interface TokenPurchase {
  id: string;
  tokenId: string;
  amount: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SecoursTransaction {
  id: string;
  subscription_id: string;
  transaction_type: 'purchase' | 'rescue_claim';
  token_amount: number;
  token_value_fcfa: number;
  payment_method: 'orange_money' | 'sama_money' | 'cinetpay' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  secours_subscriptions?: SecoursSubscription;
}

export interface RescueRequest {
  id: string;
  user_id: string;
  subscription_id: string;
  service_type: 'auto' | 'cata_catanis' | 'school_fees' | 'motors' | 'telephone';
  request_description: string;
  rescue_value_fcfa: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  request_date: string;
  processed_date?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  secours_subscriptions?: SecoursSubscription;
}

// Token types and their values
export const TOKEN_TYPES = {
  auto: {
    name: 'Auto',
    value: 750, // FCFA per token
    description: 'Emergency car assistance',
    rescueMultiplier: 1.5
  },
  cata_catanis: {
    name: 'Cata Catanis',
    value: 500,
    description: 'Natural disaster assistance',
    rescueMultiplier: 1.5
  },
  school_fees: {
    name: 'School Fees',
    value: 500,
    description: 'Education emergency support',
    rescueMultiplier: 1.5
  },
  motors: {
    name: 'Motors',
    value: 250,
    description: 'Motorcycle assistance',
    rescueMultiplier: 1.5
  },
  telephone: {
    name: 'Telephone',
    value: 250,
    description: 'Communication emergency',
    rescueMultiplier: 1.5
  },
  first_aid: {
    name: 'Premiers secours',
    value: 500,
    description: 'Assistance premiers secours',
    icon: '🩺',
    rescueMultiplier: 1.5
  }
} as const;

// Purchase limits
export const MIN_PURCHASE_PER_SERVICE = {
  auto: 10, // minimum 10 tokens
  cata_catanis: 10,
  school_fees: 10,
  motors: 10,
  telephone: 10,
  first_aid: 10,
} as const;

export const MAX_MONTHLY_PURCHASE_PER_SERVICE = {
  auto: 60, // maximum 100 tokens per month
  cata_catanis: 60,
  school_fees: 60,
  motors: 60,
  telephone: 60,
  first_aid: 60
} as const;

// Service type union type
export type ServiceType = keyof typeof TOKEN_TYPES;

// Payment methods
export type PaymentMethod = 'orange_money' | 'sama_money' | 'cinetpay' | 'code_marchant';

// Transaction status
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Request status
export type RequestStatus = 'pending' | 'approved' | 'completed' | 'rejected';
