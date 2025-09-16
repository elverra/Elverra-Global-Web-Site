import { supabase } from '@/lib/supabaseClient';

export interface PaymentVerificationResult {
  status: 'success' | 'failed' | 'pending' | 'cancelled' | 'canceled';
  reference?: string;
  amount?: number;
  message?: string;
}

export async function verifyPayment(reference: string): Promise<PaymentVerificationResult> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('status, amount, reference')
      .eq('reference', reference)
      .single();

    if (error) throw error;
    
    return {
      status: data.status,
      reference: data.reference,
      amount: data.amount,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      status: 'failed',
      message: 'Erreur lors de la vérification du paiement',
    };
  }
}
