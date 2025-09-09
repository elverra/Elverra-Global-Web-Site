export interface OSecoursToken {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  category: string;
}

export interface TokenPurchase {
  id: string;
  tokenType: string;
  amount: number;
  totalPrice: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  bonusPercentage?: number;
  paymentUrl?: string; // URL for payment redirection
}

export interface WithdrawalRequest {
  id: string;
  tokenType: string;
  amount: number;
  totalValue: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  reason?: string;
  processedDate?: string;
}

export interface TokenBalance {
  tokenId: string;
  balance: number;
  monthlyLimit: number;
  usedThisMonth: number;
  remainingBalance: number;
}

export const TOKEN_CATEGORIES = {
  education: 'Education',
  communication: 'Communication',
  transport: 'Transport',
  health: 'Health',
  emergency: 'Emergency',
  vehicle: 'Vehicle'
} as const;

export const TOKEN_TYPES: OSecoursToken[] = [
  {
    id: 'school_fee',
    name: 'School Fee Token',
    description: 'For educational expenses and school fees',
    price: 250,
    icon: '🎓',
    color: '#4ECDC4',
    category: 'education'
  },
  {
    id: 'phone',
    name: 'Phone Token',
    description: 'For communication expenses',
    price: 250,
    icon: '📱',
    color: '#667EEA',
    category: 'communication'
  },
  {
    id: 'moto',
    name: 'Moto Token',
    description: 'For motorcycle transportation',
    price: 250,
    icon: '🏍️',
    color: '#FF6B6B',
    category: 'transport'
  },
  {
    id: 'first_aid',
    name: 'First Aid Token',
    description: 'For medical emergencies',
    price: 500,
    icon: '🚑',
    color: '#96CEB4',
    category: 'health'
  },
  {
    id: 'catacatani',
    name: 'Cata Catanis Token',
    description: 'For natural disaster emergencies',
    price: 500,
    icon: '⚡',
    color: '#F7DC6F',
    category: 'emergency'
  },
  {
    id: 'voiture',
    name: 'Car Token',
    description: 'For car transportation',
    price: 750,
    icon: '🚗',
    color: '#E74C3C',
    category: 'vehicle'
  }
];

export const MIN_PURCHASE_PER_SERVICE = 10;
export const MAX_MONTHLY_PURCHASE_PER_SERVICE = 60;
