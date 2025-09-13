import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const json = (res: VercelResponse, status: number, body: any) => res.status(status).json(body);

async function creditTokens({ reference, userId, serviceType, amountFcfa, method }: { reference?: string; userId?: string; serviceType?: string; amountFcfa?: number; method: string }, supabase: ReturnType<typeof createClient> | null) {
  if (!supabase) return;
  const TOKEN_VALUES: Record<string, number> = { auto: 750, cata_catanis: 500, school_fees: 500, motors: 250, telephone: 250 };
  try {
    // Resolve missing details from attempts if needed
    if ((!userId || !serviceType || !amountFcfa) && reference) {
      const { data } = await supabase
        .from('secours_payment_attempts')
        .select('user_id, service_type, amount_fcfa')
        .eq('reference', reference)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      userId = userId || (data as any)?.user_id;
      serviceType = serviceType || (data as any)?.service_type;
      amountFcfa = amountFcfa || (data as any)?.amount_fcfa;
    }
    if (!userId || !serviceType) return;

    // Find subscription
    const { data: sub } = await supabase
      .from('secours_subscriptions')
      .select('id, token_balance')
      .eq('user_id', userId)
      .eq('subscription_type', serviceType)
      .maybeSingle();
    if (!sub?.id) return;

    const tv = TOKEN_VALUES[serviceType] || 0;
    const tokens = tv ? Math.floor((amountFcfa || 0) / tv) : 0;

    await supabase.from('secours_transactions').insert({
      subscription_id: sub.id,
      transaction_type: 'purchase',
      token_amount: tokens,
      token_value_fcfa: tv,
      payment_method: method,
      payment_status: 'completed',
      created_at: new Date().toISOString(),
    } as any);

    await supabase
      .from('secours_subscriptions')
      .update({ token_balance: (sub.token_balance || 0) + tokens })
      .eq('id', sub.id);

    if (reference) {
      await supabase
        .from('secours_payment_attempts')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('reference', reference);
    }
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CinetPay posts payload to this endpoint
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

    const payload = (req.body || {}) as any;
    const tx = payload?.transaction_id || payload?.cpm_trans_id || payload?.cpm_trans_id_form || '';
    const match = String(tx).match(/^TOKENS_([a-z_]+)_([^_]+)_\d+$/i);
    const serviceType = match?.[1];
    const userId = match?.[2];
    const status = (payload?.status || payload?.cpm_result || '').toString().toUpperCase();
    const amount = Number(payload?.amount || payload?.cpm_amount || 0);

    if (status === 'ACCEPTED') {
      await creditTokens({ reference: tx, userId, serviceType, amountFcfa: amount, method: 'cinetpay' }, supabase);
    }

    return json(res, 200, { success: true });
  } catch (e: any) {
    return json(res, 500, { success: false, message: e?.message || 'Unexpected error' });
  }
}
