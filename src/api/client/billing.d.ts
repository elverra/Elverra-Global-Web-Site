declare module '@/api/client/billing' {
  export interface PaymentVerificationResult {
    status: 'success' | 'failed' | 'pending' | 'cancelled' | 'canceled';
    reference?: string;
    amount?: number;
    message?: string;
  }

  export function verifyPayment(reference: string): Promise<PaymentVerificationResult>;
}
