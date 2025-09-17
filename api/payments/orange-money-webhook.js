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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const reference = payload?.order_id || payload?.reference || payload?.ref || payload?.orderId;
    const status = (payload?.status || payload?.status_code || '').toString().toLowerCase();
    const amount = Number(payload?.amount || 0);

    if (reference && (status === 'success' || status === 'completed' || status === 'ok')) {
      await creditTokens({
        reference,
        amountFcfa: amount,
        method: 'orange_money'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Orange webhook error:', error);
    res.json({ success: true }); // Always return success to avoid retries
  }
}
