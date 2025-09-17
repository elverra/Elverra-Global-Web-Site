import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { paymentId, gateway } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'paymentId is required' 
      });
    }

    // Check if this is a token purchase or subscription payment
    const isTokenPurchase = paymentId.includes('TOKENS_');
    const isSubscriptionPayment = paymentId.includes('SUB_') || paymentId.includes('ELV');

    if (isTokenPurchase) {
      // Check token payment attempts table
      const { data: attempt, error: attemptError } = await supabase
        .from('secours_payment_attempts')
        .select('*')
        .eq('reference', paymentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (attemptError && attemptError.code !== 'PGRST116') {
        console.error('Token payment lookup error:', attemptError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to verify token payment',
          error: attemptError.message 
        });
      }

      if (!attempt) {
        return res.status(200).json({ 
          success: true, 
          status: 'pending',
          message: 'Token payment verification in progress' 
        });
      }

      let status = 'pending';
      if (attempt.status === 'completed') {
        status = 'completed';
      } else if (attempt.status === 'failed') {
        status = 'failed';
      }

      return res.status(200).json({ 
        success: true, 
        status,
        payment: {
          id: attempt.id,
          amount: attempt.amount_fcfa,
          currency: 'XOF',
          status: attempt.status,
          created_at: attempt.created_at
        }
      });
    } else {
      // Check subscription payments table
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .or(`transaction_id.eq.${paymentId},reference.eq.${paymentId},id.eq.${paymentId}`)
        .single();

      if (paymentError && paymentError.code !== 'PGRST116') {
        console.error('Payment lookup error:', paymentError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to verify payment',
          error: paymentError.message 
        });
      }

      if (!payment) {
        // Payment not found, still pending
        return res.status(200).json({ 
          success: true, 
          status: 'pending',
          message: 'Payment verification in progress' 
        });
      }

      // Check payment status
      let status = 'pending';
      if (payment.status === 'completed' || payment.status === 'success') {
        status = 'completed';
        
        // If payment is completed, update user subscription/membership
        if (payment.user_id && payment.subscription_id) {
          try {
            // Update subscription status
            await supabase
              .from('subscriptions')
              .update({ 
                status: 'active',
                activated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', payment.subscription_id);

            // Update user membership tier if plan is specified
            if (payment.metadata && payment.metadata.planType) {
              await supabase
                .from('users')
                .update({ 
                  membership_tier: payment.metadata.planType,
                  updated_at: new Date().toISOString()
                })
                .eq('id', payment.user_id);
            }

            // Award affiliate commission (membership payment or renewal)
            try {
              const rewardType = (payment.metadata && (payment.metadata.type === 'renewal' || payment.metadata.isRenewal)) 
                ? 'membership_renewal' 
                : 'membership_payment';
              const amountXof = Number(payment.amount || 0);
              const ref = payment.reference || payment.transaction_id || payment.id;
              await supabase.rpc('award_affiliate_commission', {
                paying_user: payment.user_id,
                amount_xof: amountXof,
                payment_ref: ref,
                reward: rewardType
              });
            } catch (rpcError) {
              console.error('Failed to award affiliate commission:', rpcError);
            }
          } catch (updateError) {
            console.error('Error updating subscription/user:', updateError);
            // Don't fail the verification, just log the error
          }
        }
      } else if (payment.status === 'failed' || payment.status === 'cancelled') {
        status = 'failed';
      }

      return res.status(200).json({ 
        success: true, 
        status,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          created_at: payment.created_at
        }
      });
    }


  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
