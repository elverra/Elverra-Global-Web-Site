import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Token values mapping
const TOKEN_VALUES = {
  auto: 750,
  cata_catanis: 500,
  school_fees: 500,
  motors: 250,
  telephone: 250,
  first_aid: 250
};

// Credit tokens after successful payment
async function creditTokens(params) {
  try {
    let { userId, serviceType, tokens, amountFcfa, reference, method } = params;

    // If missing data, try to get from payment attempts
    if ((!userId || !serviceType || !tokens || !amountFcfa) && reference) {
      const { data } = await supabase
        .from('secours_payment_attempts')
        .select('user_id, service_type, tokens, amount_fcfa')
        .eq('reference', reference)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      userId = userId || data?.user_id;
      serviceType = serviceType || data?.service_type;
      tokens = tokens || data?.tokens;
      amountFcfa = amountFcfa || data?.amount_fcfa;
    }

    if (!userId || !serviceType) return;

    // Find subscription
    const { data: sub } = await supabase
      .from('secours_subscriptions')
      .select('id, token_balance')
      .eq('user_id', userId)
      .eq('plan', serviceType)
      .maybeSingle();

    if (!sub?.id) return;

    // Calculate tokens if missing
    const tokenValue = TOKEN_VALUES[serviceType] || 0;
    const computedTokens = tokens || (tokenValue ? Math.floor((amountFcfa || 0) / tokenValue) : 0);

    // Insert transaction
    await supabase.from('secours_transactions').insert({
      subscription_id: sub.id,
      transaction_type: 'purchase',
      token_amount: computedTokens,
      token_value_fcfa: tokenValue,
      payment_method: method,
      payment_status: 'completed',
      created_at: new Date().toISOString()
    });

    // Update balance
    await supabase
      .from('secours_subscriptions')
      .update({ token_balance: (sub.token_balance || 0) + computedTokens })
      .eq('id', sub.id);

    // Mark attempt completed
    if (reference) {
      await supabase
        .from('secours_payment_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('reference', reference);
    }
  } catch (error) {
    console.error('Error crediting tokens:', error);
  }
}

// Create subscription payment record
async function createSubscriptionPayment(params) {
  try {
    const { userId, subscriptionId, amount, reference, status, metadata } = params;

    // Insert payment record
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount: amount,
        currency: 'XOF',
        status: status,
        payment_method: 'sama_money',
        transaction_id: reference,
        reference: reference,
        metadata: metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (status === 'completed' && subscriptionId) {
      // Activate subscription
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      // Update user membership if plan is specified
      if (metadata?.planType && userId) {
        await supabase
          .from('users')
          .update({
            membership_tier: metadata.planType,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    }

    return payment;
  } catch (error) {
    console.error('Error creating subscription payment:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    console.log('SAMA Money webhook payload:', payload);

    const reference = payload?.idCommande || payload?.reference || payload?.orderId;
    const status = (payload?.status || payload?.etat || '').toString().toLowerCase();
    const amount = Number(payload?.montant || payload?.amount || 0);

    if (!reference) {
      console.log('No reference found in SAMA webhook');
      return res.json({ success: true });
    }

    // Determine if this is a token purchase or subscription payment
    const isTokenPurchase = reference.includes('TOKENS_');
    const isSubscriptionPayment = reference.includes('SUB_') || reference.includes('ELV');

    if (status === 'success' || status === 'completed' || status === '1' || payload?.status === 1) {
      if (isTokenPurchase) {
        // Handle token purchase
        await creditTokens({
          reference,
          amountFcfa: amount,
          method: 'sama_money'
        });
      } else if (isSubscriptionPayment) {
        // Handle subscription payment - look up pending subscription
        const { data: attempt } = await supabase
          .from('payment_attempts')
          .select('user_id, subscription_id, metadata')
          .eq('reference', reference)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attempt) {
          await createSubscriptionPayment({
            userId: attempt.user_id,
            subscriptionId: attempt.subscription_id,
            amount: amount,
            reference: reference,
            status: 'completed',
            metadata: attempt.metadata
          });
        }
      }
    } else if (status === 'failed' || status === 'cancelled' || status === 'error' || payload?.status === 0) {
      // Handle failed/cancelled payments
      if (isSubscriptionPayment) {
        const { data: attempt } = await supabase
          .from('payment_attempts')
          .select('user_id, subscription_id, metadata')
          .eq('reference', reference)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attempt) {
          await createSubscriptionPayment({
            userId: attempt.user_id,
            subscriptionId: attempt.subscription_id,
            amount: amount,
            reference: reference,
            status: 'failed',
            metadata: attempt.metadata
          });
        }
      }

      // Mark token attempts as failed
      if (isTokenPurchase) {
        await supabase
          .from('secours_payment_attempts')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('reference', reference);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('SAMA webhook error:', error);
    res.json({ success: true }); // Always return success to avoid retries
  }
}
