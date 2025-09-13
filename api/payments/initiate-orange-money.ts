// @ts-nocheck
// Legacy Vercel Serverless function (not used). This endpoint is superseded by Supabase Edge Function at
// `supabase/functions/api/index.ts` which handles POST /api/payments/initiate-orange-money.
// Keeping this file for reference; TypeScript checking is disabled to avoid requiring `@vercel/node` types.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const json = (res: VercelResponse, status: number, body: any) => res.status(status).json(body);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { success: false, message: 'Method not allowed' });
  try {
    const {
      userId,
      amount,
      currency = 'XOF',
      phone,
      email,
      name,
      reference,
      metadata,
    } = (req.body || {}) as any;

    const ORANGE_BASIC_AUTH = process.env.ORANGE_BASIC_AUTH as string;
    const ORANGE_MERCHANT_KEY = process.env.ORANGE_MERCHANT_KEY as string;
    const ORANGE_ENV = (process.env.ORANGE_ENV || 'dev').toLowerCase();
    const ORANGE_RETURN_URL = process.env.ORANGE_RETURN_URL as string;
    const ORANGE_CANCEL_URL = process.env.ORANGE_CANCEL_URL as string;
    const ORANGE_NOTIF_URL = process.env.ORANGE_NOTIF_URL as string;

    if (!ORANGE_BASIC_AUTH || !ORANGE_MERCHANT_KEY) {
      return json(res, 500, { success: false, message: 'Orange Money not configured' });
    }
    if (!reference || !amount) {
      return json(res, 400, { success: false, message: 'Missing reference or amount' });
    }

    // OAuth
    const oauth = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${ORANGE_BASIC_AUTH}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: 'grant_type=client_credentials',
    });
    if (!oauth.ok) {
      const err = await oauth.text();
      return json(res, 502, { success: false, message: 'Orange OAuth failed', details: err });
    }
    const { access_token } = await oauth.json() as any;
    if (!access_token) return json(res, 502, { success: false, message: 'No access_token' });

    const base = ORANGE_ENV === 'prod' || ORANGE_ENV === 'production'
      ? 'https://api.orange.com/orange-money-webpay/v1'
      : 'https://api.orange.com/orange-money-webpay/dev/v1';

    const wp = await fetch(`${base}/webpayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        merchant_key: ORANGE_MERCHANT_KEY,
        currency: ORANGE_ENV === 'prod' ? 'XOF' : 'OUV',
        order_id: reference,
        amount: String(amount),
        return_url: ORANGE_RETURN_URL,
        cancel_url: ORANGE_CANCEL_URL,
        notif_url: ORANGE_NOTIF_URL,
        lang: 'fr',
        reference,
      }),
    });
    const text = await wp.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!wp.ok) return json(res, 502, { success: false, message: 'Orange webpayment failed', details: data });

    // Optionally record attempt in Supabase
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from('secours_payment_attempts').insert({
          reference,
          user_id: userId ?? null,
          service_type: metadata?.serviceType ?? null,
          tokens: metadata?.tokens ?? null,
          amount_fcfa: amount,
          method: 'orange_money',
          status: 'pending',
          gateway_data: data,
        } as any);
      } catch {}
    }

    return json(res, 200, {
      success: true,
      paymentUrl: data?.payment_url,
      payToken: data?.pay_token,
      data,
    });
  } catch (e: any) {
    return json(res, 500, { success: false, message: e?.message || 'Unexpected error' });
  }
}

