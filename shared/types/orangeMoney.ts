export interface OrangeMoneyPaymentResponse {
  success: boolean;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
  reference?: string;
  paymentId?: string;
  orderId?: string;
  _rawResponse?: Record<string, any>;
  metadata?: any;
}

export interface OrangeMoneyPaymentRequest {
  userId: string;
  amount: number;
  phoneNumber: string;
  description: string;
  metadata?: Record<string, any>;
}
