// Mock services to replace API calls - designed for easy Supabase migration
// All functions return promises to simulate async operations

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  membershipTier: 'essential' | 'premium' | 'elite' | null;
  isActive: boolean;
  createdAt: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface TokenBalance {
  id: string;
  userId: string;
  tokenType: string;
  balance: number;
  value: number;
}

export interface Subscription {
  id: string;
  userId: string;
  subscriptionType: string;
  tokenBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  contact?: string;
  sellerName?: string;
  location?: string;
  isActive: boolean;
  userId: string;
  createdAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary: string;
  type: 'full-time' | 'part-time' | 'contract';
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  experience_level: string;
  remote_allowed: boolean;
  application_count: number;
  created_at: string;
  application_deadline?: string;
  isActive: boolean;
  createdAt: string;
}

// Mock data storage (will be replaced with Supabase)
let mockUsers: User[] = [];
let mockProducts: Product[] = [];
let mockJobs: Job[] = [];
let mockSubscriptions: Subscription[] = [];
let mockTokenBalances: TokenBalance[] = [];

// Auth Services
export const authService = {
  async register(userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: userData.email || '',
      phone: userData.phone || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      membershipTier: null,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return { success: true, user: newUser };
  },

  async login(email: string, _password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid credentials' };
  },

  async updatePassword(_userId: string, _newPassword: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return { success: true, user: mockUsers[userIndex] };
    }
    
    return { success: false, error: 'User not found' };
  }
};

// Payment Services
export const paymentService = {
  async processPayment(_amount: number, _membershipTier: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate payment success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
        paymentUrl: '/payment/success'
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.'
      };
    }
  },

  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      transactionId
    };
  }
};

// Token Services (Ô Secours)
export const tokenService = {
  async getTokenBalances(userId: string): Promise<{ success: boolean; data?: TokenBalance[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const balances = mockTokenBalances.filter(b => b.userId === userId);
    return { success: true, data: balances };
  },

  async purchaseTokens(userId: string, tokenType: string, amount: number): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate token purchase
    const newBalance: TokenBalance = {
      id: `balance_${Date.now()}`,
      userId,
      tokenType,
      balance: amount,
      value: getTokenValue(tokenType)
    };
    
    mockTokenBalances.push(newBalance);
    
    return { 
      success: true, 
      paymentUrl: '/payment/success?type=tokens' 
    };
  },

  async getSubscriptions(userId: string): Promise<{ success: boolean; data?: Subscription[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const subscriptions = mockSubscriptions.filter(s => s.userId === userId);
    return { success: true, data: subscriptions };
  }
};

// Product Services
export const productService = {
  async getProducts(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return { success: true, data: mockProducts.filter(p => p.isActive) };
  },

  async getUserProducts(userId: string): Promise<{ success: boolean; data?: Product[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userProducts = mockProducts.filter(p => p.userId === userId);
    return { success: true, data: userProducts };
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<{ success: boolean; product?: Product; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProduct: Product = {
      ...productData,
      id: `product_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    mockProducts.push(newProduct);
    
    return { success: true, product: newProduct };
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index >= 0) {
      mockProducts.splice(index, 1);
      return { success: true };
    }
    
    return { success: false, error: 'Product not found' };
  }
};

// Job Services
export const jobService = {
  async getJobs(): Promise<{ success: boolean; data?: Job[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return { success: true, data: mockJobs.filter(j => j.isActive) };
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<{ success: boolean; job?: Job; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newJob: Job = {
      ...jobData,
      id: `job_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    mockJobs.push(newJob);
    
    return { success: true, job: newJob };
  },

  async toggleJobStatus(jobId: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
      job.isActive = !job.isActive;
      return { success: true };
    }
    
    return { success: false, error: 'Job not found' };
  },

  async deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockJobs.findIndex(j => j.id === jobId);
    if (index >= 0) {
      mockJobs.splice(index, 1);
      return { success: true };
    }
    
    return { success: false, error: 'Job not found' };
  }
};

// Admin Services
export const adminService = {
  async getStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        totalUsers: mockUsers.length,
        totalProducts: mockProducts.length,
        totalJobs: mockJobs.length,
        activeSubscriptions: mockSubscriptions.filter(s => s.isActive).length
      }
    };
  },

  async exportDatabase(): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      downloadUrl: '/exports/database_export.json'
    };
  }
};

// Helper functions
function getTokenValue(tokenType: string): number {
  const values: Record<string, number> = {
    'auto': 750,
    'cata_catanis': 500,
    'school_fees': 500,
    'motors': 250,
    'telephone': 250
  };
  
  return values[tokenType] || 250;
}

// Mock data for discounts
const mockSectors: any[] = [
  {
    id: 'sector_1',
    name: 'Restaurants',
    description: 'Food and dining establishments',
    is_active: true
  },
  {
    id: 'sector_2',
    name: 'Retail',
    description: 'Shopping and retail stores',
    is_active: true
  }
];

const mockMerchants: any[] = [
  {
    id: 'merchant_1',
    name: 'Restaurant Le Bambou',
    sector_id: 'sector_1',
    sector: { name: 'Restaurants' },
    discount_percentage: 15,
    location: 'Bamako, Mali',
    contact_phone: '+22370000001',
    contact_email: 'contact@lebambou.ml',
    description: 'Authentic Malian cuisine',
    website: 'https://lebambou.ml',
    logo_url: '/placeholder.svg',
    rating: 4.5,
    is_active: true,
    featured: true
  }
];

// Additional services for hooks compatibility
export const discountService = {
  async getDiscounts(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: [] };
  },

  async getSectors(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockSectors;
  },

  async createSector(sectorData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newSector = {
      id: `sector_${Date.now()}`,
      ...sectorData
    };
    mockSectors.push(newSector);
    return newSector;
  },

  async updateSector(id: string, sectorData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockSectors.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSectors[index] = { ...mockSectors[index], ...sectorData };
      return mockSectors[index];
    }
    return null;
  },

  async deleteSector(id: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockSectors.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSectors.splice(index, 1);
    }
    return { success: true };
  },

  async getMerchants(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMerchants;
  },

  async createMerchant(merchantData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 700));
    const newMerchant = {
      id: `merchant_${Date.now()}`,
      ...merchantData,
      sector: mockSectors.find(s => s.id === merchantData.sector_id) || { name: 'Unknown' }
    };
    mockMerchants.push(newMerchant);
    return newMerchant;
  },

  async updateMerchant(id: string, merchantData: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 700));
    const index = mockMerchants.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMerchants[index] = { 
        ...mockMerchants[index], 
        ...merchantData,
        sector: mockSectors.find(s => s.id === merchantData.sector_id) || { name: 'Unknown' }
      };
      return mockMerchants[index];
    }
    return null;
  },

  async deleteMerchant(id: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockMerchants.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMerchants.splice(index, 1);
    }
    return { success: true };
  }
};

export const membershipService = {
  async getMembership(_userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, data: null };
  },

  async updateMembership(_userId: string, _updates: any): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true };
  }
};

export const affiliateService = {
  async getAffiliateData(_userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return { success: true, data: { referrals: [], commissions: [] } };
  }
};

// Initialize with some mock data
export const initializeMockData = () => {
  // Add some sample users
  mockUsers.push({
    id: 'user_1',
    email: 'admin@elverra.com',
    phone: '+22370000000',
    firstName: 'Admin',
    lastName: 'User',
    membershipTier: 'elite',
    isActive: true,
    createdAt: new Date().toISOString()
  });

  // Add some sample products
  mockProducts.push({
    id: 'product_1',
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 25000,
    category: 'Electronics',
    imageUrl: '/placeholder.svg',
    isActive: true,
    userId: 'user_1'
  });

  // Add some sample jobs
  mockJobs.push({
    id: 'job_1',
    title: 'Software Developer',
    company: 'Elverra Global',
    location: 'Bamako, Mali',
    description: 'We are looking for a talented software developer...',
    requirements: ['JavaScript', 'React', 'Node.js'],
    salary: '500,000 - 800,000 CFA',
    type: 'full-time',
    employment_type: 'full-time',
    salary_min: 500000,
    salary_max: 800000,
    currency: 'CFA',
    experience_level: 'Mid-level',
    remote_allowed: true,
    application_count: 15,
    created_at: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString()
  });
};
