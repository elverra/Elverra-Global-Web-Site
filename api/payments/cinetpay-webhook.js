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
  telephone: 250
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
    const transactionId = payload?.transaction_id || payload?.cpm_trans_id || payload?.cpm_trans_id_form || '';
    const match = String(transactionId).match(/^TOKENS_([a-z_]+)_([^_]+)_\d+$/i);
    const serviceType = match?.[1];
    const userId = match?.[2];
    const status = (payload?.status || payload?.cpm_result || '').toString().toUpperCase();
    const amount = Number(payload?.amount || payload?.cpm_amount || 0);

    if (status === 'ACCEPTED') {
      await creditTokens({
        userId,
        reference: transactionId,
        serviceType,
        amountFcfa: amount,
        method: 'cinetpay'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('CinetPay webhook error:', error);
    res.json({ success: true }); // Always return success to avoid retries
  }
}
