import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const json = (res: VercelResponse, status: number, body: any) => res.status(status).json(body);

async function creditTokens({ reference, amountFcfa, method }: { reference?: string; amountFcfa?: number; method: string }, supabase: ReturnType<typeof createClient> | null) {
  if (!supabase || !reference) return;
  const TOKEN_VALUES: Record<string, number> = { auto: 750, cata_catanis: 500, school_fees: 500, motors: 250, telephone: 250 };
  try {
    const { data: attempt } = await supabase
      .from('secours_payment_attempts')
      .select('user_id, service_type, tokens, amount_fcfa')
      .eq('reference', reference)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const userId = (attempt as any)?.user_id as string | undefined;
    const serviceType = (attempt as any)?.service_type as string | undefined;
    const amt = amountFcfa || (attempt as any)?.amount_fcfa;
    if (!userId || !serviceType) return;

    const { data: sub } = await supabase
      .from('secours_subscriptions')
      .select('id, token_balance')
      .eq('user_id', userId)
      .eq('subscription_type', serviceType)
      .maybeSingle();
    if (!sub?.id) return;

    const tv = TOKEN_VALUES[serviceType] || 0;
    const tokens = (attempt as any)?.tokens ?? (tv ? Math.floor(Number(amt || 0) / tv) : 0);

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

    await supabase
      .from('secours_payment_attempts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('reference', reference);
  } catch {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

    const payload = (req.body || {}) as any;
    const reference = payload?.order_id || payload?.reference || payload?.ref || payload?.orderId;
    const status = (payload?.status || payload?.status_code || '').toString().toLowerCase();
    const amount = Number(payload?.amount || 0);

    if (reference && (status === 'success' || status === 'completed' || status === 'ok')) {
      await creditTokens({ reference, amountFcfa: amount, method: 'orange_money' }, supabase);
    }

    return json(res, 200, { success: true });
  } catch (e: any) {
    return json(res, 500, { success: false, message: e?.message || 'Unexpected error' });
  }
}
