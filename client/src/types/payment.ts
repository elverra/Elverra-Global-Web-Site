export interface PaymentGateway {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'card' | 'crypto';
  isActive: boolean;
  config: {
    apiKey?: string;
    merchantId?: string;
    merchantCode?: string;
    merchantName?: string;
    merchantLogin?: string;
    merchantAccountNumber?: string;
    merchantKey?: string;
    userId?: string;
    publicKey?: string;
    privateKey?: string;
    transactionKey?: string;
    baseUrl?: string;
    clientId?: string;
    clientSecret?: string;
    webhookUrl?: string;
    callbackUrl?: string;
    returnUrl?: string;
    environment?: 'test' | 'production';
    supportedCurrencies: string[];
    timeout?: number;
    maxRetries?: number;
  };
  fees: {
    percentage: number;
    fixed: number;
  };
  icon: string;
  description: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'error';
  lastTested?: string;
  testResults?: {
    success: boolean;
    message: string;
    timestamp: string;
  };
}

export interface PaymentService {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  category: 'membership' | 'job_posting' | 'product_listing' | 'tokens' | 'other';
}

export interface PaymentRequest {
  serviceId: string;
  amount: number;
  currency?: string;
  description?: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
  paymentMethod?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  gatewayResponse?: any;
}