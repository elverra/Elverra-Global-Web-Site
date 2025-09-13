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
      description,
      url,
    } = (req.body || {}) as any;

    const SAMA_BASE_URL = (process.env.SAMA_BASE_URL || 'https://smarchandamatest.sama.money/V1').replace(/\/$/, '');
    const SAMA_TRANSAC = process.env.SAMA_TRANSAC as string;
    const SAMA_CMD = (process.env.SAMA_CMD as string) || 'b109';
    const SAMA_CLE_PUBLIQUE = process.env.SAMA_CLE_PUBLIQUE as string;

    if (!SAMA_TRANSAC || !SAMA_CLE_PUBLIQUE) {
      return json(res, 500, { success: false, message: 'SAMA Money not configured' });
    }

    if (!reference || !amount || !phone) {
      return json(res, 400, { success: false, message: 'Missing reference, amount or phone' });
    }

    // 1) Auth
    const auth = await fetch(`${SAMA_BASE_URL}/marchand/auth`, {
      method: 'POST',
      headers: {
        TRANSAC: SAMA_TRANSAC,
        cmd: SAMA_CMD,
        cle_publique: SAMA_CLE_PUBLIQUE,
      } as any,
    });
    const authText = await auth.text();
    let authJson: any; try { authJson = JSON.parse(authText); } catch { authJson = { raw: authText }; }
    if (!auth.ok || authJson?.status !== 1) {
      return json(res, 502, { success: false, message: 'SAMA auth failed', details: authJson });
    }
    const token = authJson?.resultat?.token as string;
    if (!token) return json(res, 502, { success: false, message: 'SAMA token missing' });

    // 2) Pay
    const pay = await fetch(`${SAMA_BASE_URL}/marchand/pay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        TRANSAC: SAMA_TRANSAC,
        'Content-Type': 'application/x-www-form-urlencoded',
      } as any,
      body: new URLSearchParams({
        cmd: SAMA_CMD,
        idCommande: reference,
        phoneClient: phone,
        montant: String(Math.trunc(Number(amount))),
        description: description || 'Ô Secours token purchase',
        url: url || process.env.VITE_APP_URL || 'https://elverraglobalml.com',
      }),
    });
    const payText = await pay.text();
    let payJson: any; try { payJson = JSON.parse(payText); } catch { payJson = { raw: payText }; }
    if (!pay.ok || payJson?.status !== 1) {
      return json(res, 502, { success: false, message: 'SAMA pay failed', details: payJson });
    }

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
          method: 'sama_money',
          status: 'pending',
          gateway_data: payJson,
        } as any);
      } catch {}
    }

    return json(res, 200, { success: true, initiated: true, reference, data: payJson });
  } catch (e: any) {
    return json(res, 500, { success: false, message: e?.message || 'Unexpected error' });
  }
}
