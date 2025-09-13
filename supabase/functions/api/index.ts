// @ts-nocheck
// Supabase Edge Function: api
// Routes:
//  - POST /api/payments/initiate-orange-money
//  - POST /api/payments/initiate-sama-money
//  - POST /api/payments/verify
//  - POST /api/payments/cinetpay-webhook
//  - POST /api/payments/orange-money-webhook
// Deno runtime

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS configuration
const APP_ORIGIN = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_ORIGIN") || "*"; // e.g. http://localhost:3000 or https://elverraglobalml.com
const ALLOW_ORIGIN = APP_ORIGIN === "*" ? "*" : APP_ORIGIN;
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOW_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

// Utility: JSON response (always with CORS headers)
const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...(init.headers || {}),
    },
  });

// Handle CORS preflight
const handleOptions = (req: Request) => {
  // If you prefer to reflect Origin dynamically:
  // const origin = req.headers.get("Origin") || ALLOW_ORIGIN;
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// Read required env
const ORANGE_BASIC_AUTH = Deno.env.get("ORANGE_BASIC_AUTH") ?? "";
const ORANGE_MERCHANT_KEY = Deno.env.get("ORANGE_MERCHANT_KEY") ?? "";
const ORANGE_ENV = (Deno.env.get("ORANGE_ENV") ?? "dev").toLowerCase();
const ORANGE_RETURN_URL = Deno.env.get("ORANGE_RETURN_URL") ?? "";
const ORANGE_CANCEL_URL = Deno.env.get("ORANGE_CANCEL_URL") ?? "";
const ORANGE_NOTIF_URL = Deno.env.get("ORANGE_NOTIF_URL") ?? "";

const SAMA_BASE_URL = Deno.env.get("SAMA_BASE_URL") ?? "https://smarchandamatest.sama.money/V1";
const SAMA_TRANSAC = Deno.env.get("SAMA_TRANSAC") ?? "";
const SAMA_CMD = Deno.env.get("SAMA_CMD") ?? "b109";
const SAMA_CLE_PUBLIQUE = Deno.env.get("SAMA_CLE_PUBLIQUE") ?? "";

// Helper: robust JSON body parsing
async function readJson<T = any>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    return {} as T;
  }
}

// Supabase client (service role)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { global: { fetch: fetch as any } })
  : null;

// Token value mapping
const TOKEN_VALUES: Record<string, number> = {
  auto: 750,
  cata_catanis: 500,
  school_fees: 500,
  motors: 250,
  telephone: 250,
};

// Persist a pending payment attempt for webhook reconciliation
async function recordAttempt(input: {
  reference: string;
  userId?: string;
  serviceType?: string;
  tokens?: number;
  amountFcfa: number;
  method: string;
  gatewayData?: any;
}) {
  try {
    if (!supabase) return;
    await supabase.from("secours_payment_attempts").insert({
      reference: input.reference,
      user_id: input.userId ?? null,
      service_type: input.serviceType ?? null,
      tokens: input.tokens ?? null,
      amount_fcfa: input.amountFcfa,
      method: input.method,
      status: "pending",
      gateway_data: input.gatewayData ?? null,
      created_at: new Date().toISOString(),
    } as any);
  } catch (_e) {
    // Table may not exist; fail silently to not block payment
  }
}

// Credit tokens upon confirmed payment
async function creditTokens(params: { userId?: string; reference?: string; serviceType?: string; tokens?: number; amountFcfa?: number; method: string }) {
  try {
    if (!supabase) return;
    let userId = params.userId;
    let serviceType = params.serviceType;
    let tokens = params.tokens;
    let amountFcfa = params.amountFcfa;

    // If missing, attempt resolve from attempts table by reference
    if ((!userId || !serviceType || !tokens || !amountFcfa) && params.reference) {
      const { data } = await supabase
        .from("secours_payment_attempts")
        .select("user_id, service_type, tokens, amount_fcfa")
        .eq("reference", params.reference)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      userId = userId || data?.user_id || undefined;
      serviceType = serviceType || data?.service_type || undefined;
      tokens = tokens || data?.tokens || undefined;
      amountFcfa = amountFcfa || data?.amount_fcfa || undefined;
    }

    if (!userId || !serviceType) return;

    // Find subscription for this user+service
    const { data: sub } = await supabase
      .from("secours_subscriptions")
      .select("id, token_balance")
      .eq("user_id", userId)
      .eq("subscription_type", serviceType)
      .maybeSingle();

    if (!sub?.id) return;

    // If tokens missing, derive from amount/token value
    const tv = TOKEN_VALUES[serviceType] || 0;
    const computedTokens = tokens || (tv ? Math.floor((amountFcfa || 0) / tv) : 0);

    // Insert transaction
    await supabase.from("secours_transactions").insert({
      subscription_id: sub.id,
      transaction_type: "purchase",
      token_amount: computedTokens,
      token_value_fcfa: tv,
      payment_method: params.method,
      payment_status: "completed",
      created_at: new Date().toISOString(),
    } as any);

    // Update balance
    await supabase
      .from("secours_subscriptions")
      .update({ token_balance: (sub.token_balance || 0) + computedTokens })
      .eq("id", sub.id);

    // Mark attempt completed
    if (params.reference) {
      await supabase
        .from("secours_payment_attempts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("reference", params.reference);
    }
  } catch (_e) {
    // Do not throw from webhook
  }
}

// ORANGE MONEY FLOW
async function initiateOrangeMoney(req: Request) {
  const body = await readJson<{
    userId: string;
    amount: number;
    currency?: string;
    phone?: string;
    email?: string;
    name?: string;
    reference: string;
    metadata?: Record<string, unknown>;
  }>(req);

  if (!ORANGE_BASIC_AUTH || !ORANGE_MERCHANT_KEY) {
    return json({ success: false, message: "Orange Money not configured" }, { status: 500 });
  }

  if (!body?.reference || !body?.amount) {
    return json({ success: false, message: "Missing reference or amount" }, { status: 400 });
  }

  // Step 1: Get OAuth token
  const tokenRes = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${ORANGE_BASIC_AUTH}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return json({ success: false, message: "Orange OAuth failed", details: err }, { status: 502 });
  }
  const tokenData = await tokenRes.json();
  const access_token: string | undefined = tokenData?.access_token;
  if (!access_token) {
    return json({ success: false, message: "No access_token from Orange" }, { status: 502 });
  }

  // Step 2: Create WebPayment
  const base = ORANGE_ENV === "prod" || ORANGE_ENV === "production"
    ? "https://api.orange.com/orange-money-webpay/v1"
    : "https://api.orange.com/orange-money-webpay/dev/v1";

  const wpRes = await fetch(`${base}/webpayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_key: ORANGE_MERCHANT_KEY,
      currency: ORANGE_ENV === "prod" ? "XOF" : "OUV",
      order_id: body.reference,
      amount: String(body.amount),
      return_url: ORANGE_RETURN_URL,
      cancel_url: ORANGE_CANCEL_URL,
      notif_url: ORANGE_NOTIF_URL,
      lang: "fr",
      reference: body.reference,
    }),
  });

  const wpText = await wpRes.text();
  let wpJson: any;
  try { wpJson = JSON.parse(wpText); } catch { wpJson = { raw: wpText }; }
  if (!wpRes.ok) {
    return json({ success: false, message: "Orange webpayment failed", details: wpJson }, { status: 502 });
  }

  // Record attempt for later webhook reconciliation
  await recordAttempt({
    reference: body.reference,
    userId: body.userId,
    serviceType: (body.metadata as any)?.serviceType,
    tokens: (body.metadata as any)?.tokens,
    amountFcfa: body.amount,
    method: "orange_money",
    gatewayData: wpJson,
  });

  // Orange returns: payment_url, pay_token, notif_token
  return json({
    success: true,
    paymentUrl: wpJson?.payment_url,
    payToken: wpJson?.pay_token,
    data: wpJson,
  });
}

// SAMA MONEY FLOW
async function initiateSamaMoney(req: Request) {
  const body = await readJson<{
    userId: string;
    amount: number;
    currency?: string; // XOF
    phone: string;
    email?: string;
    name?: string;
    reference: string; // idCommande
    metadata?: Record<string, unknown>;
    description?: string;
    url?: string;
  }>(req);

  if (!SAMA_TRANSAC || !SAMA_CLE_PUBLIQUE) {
    return json({ success: false, message: "SAMA Money not configured" }, { status: 500 });
  }
  if (!body?.reference || !body?.amount || !body?.phone) {
    return json({ success: false, message: "Missing reference, amount or phone" }, { status: 400 });
  }

  // 1) Auth
  const authRes = await fetch(`${SAMA_BASE_URL}/marchand/auth`, {
    method: "POST",
    headers: {
      TRANSAC: SAMA_TRANSAC,
      cmd: SAMA_CMD,
      cle_publique: SAMA_CLE_PUBLIQUE,
    },
  });
  const authText = await authRes.text();
  let authJson: any;
  try { authJson = JSON.parse(authText); } catch { authJson = { raw: authText }; }
  if (!authRes.ok || authJson?.status !== 1) {
    return json({ success: false, message: "SAMA auth failed", details: authJson }, { status: 502 });
  }
  const samaToken: string = authJson?.resultat?.token;
  if (!samaToken) {
    return json({ success: false, message: "SAMA token missing" }, { status: 502 });
  }

  // 2) Pay (SAMA expects headers + body keys)
  const payRes = await fetch(`${SAMA_BASE_URL}/marchand/pay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${samaToken}`,
      TRANSAC: SAMA_TRANSAC,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      cmd: SAMA_CMD,
      idCommande: body.reference,
      phoneClient: body.phone,
      montant: String(Math.trunc(body.amount)),
      description: body.description || `Ô Secours token purchase`,
      url: body.url || Deno.env.get("VITE_APP_URL") || "https://elverraglobal.com",
    }),
  });
  const payText = await payRes.text();
  let payJson: any;
  try { payJson = JSON.parse(payText); } catch { payJson = { raw: payText }; }
  if (!payRes.ok || payJson?.status !== 1) {
    return json({ success: false, message: "SAMA pay failed", details: payJson }, { status: 502 });
  }

  // Record attempt for later webhook reconciliation
  await recordAttempt({
    reference: body.reference,
    userId: body.userId,
    serviceType: (body.metadata as any)?.serviceType,
    tokens: (body.metadata as any)?.tokens,
    amountFcfa: body.amount,
    method: "sama_money",
    gatewayData: payJson,
  });

  return json({ success: true, initiated: true, reference: body.reference, data: payJson });
}

// VERIFY (currently implements SAMA query; can be extended for Orange/CinetPay)
async function verifyPayment(req: Request) {
  const body = await readJson<{ paymentId?: string; reference?: string; gateway?: string }>(req);
  const gateway = (body.gateway || "sama_money").toLowerCase();

  if (gateway === "sama_money") {
    if (!SAMA_TRANSAC) return json({ success: false, message: "SAMA not configured" }, { status: 500 });
    const reference = body.reference || body.paymentId;
    if (!reference) return json({ success: false, message: "Missing reference" }, { status: 400 });

    const infoRes = await fetch(`${SAMA_BASE_URL}/marchand/transaction/infos`, {
      method: "POST",
      headers: {
        TRANSAC: SAMA_TRANSAC,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ cmd: SAMA_CMD, idCommande: reference }),
    });

    const infoText = await infoRes.text();
    let infoJson: any;
    try { infoJson = JSON.parse(infoText); } catch { infoJson = { raw: infoText }; }
    if (!infoRes.ok) return json({ success: false, message: "SAMA verify failed", details: infoJson }, { status: 502 });

    // Map status
    const status = infoJson?.status === 1 ? "completed" : (infoJson?.status === 0 ? "pending" : "failed");
    return json({ success: true, status, data: infoJson });
  }

  // TODO: Implement Orange & CinetPay verification if needed
  return json({ success: false, message: "Gateway verification not implemented" }, { status: 400 });
}

// CinetPay webhook
async function cinetpayWebhook(req: Request) {
  const payload = await readJson<any>(req);
  try {
    // transaction_id format we set: TOKENS_${service}_${userId}_${timestamp}
    const tx = payload?.transaction_id || payload?.cpm_trans_id || payload?.cpm_trans_id_form || "";
    const m = String(tx).match(/^TOKENS_([a-z_]+)_([^_]+)_\d+$/i);
    const serviceType = m?.[1];
    const userId = m?.[2];
    const status = (payload?.status || payload?.cpm_result || "").toString().toUpperCase();
    const amount = Number(payload?.amount || payload?.cpm_amount || 0);
    if (status === "ACCEPTED") {
      await creditTokens({ userId, reference: tx, serviceType, amountFcfa: amount, method: "cinetpay" });
    }
  } catch (_e) {}
  return json({ success: true });
}

// Orange Money webhook
async function orangeWebhook(req: Request) {
  const payload = await readJson<any>(req);
  try {
    // Orange sends reference we provided (order_id/reference)
    const reference = payload?.order_id || payload?.reference || payload?.ref || payload?.orderId;
    const status = (payload?.status || payload?.status_code || "").toString().toLowerCase();
    const amount = Number(payload?.amount || 0);
    if (reference && (status === "success" || status === "completed" || status === "ok")) {
      await creditTokens({ reference, amountFcfa: amount, method: "orange_money" });
    }
  } catch (_e) {}
  return json({ success: true });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const { pathname } = url;
  // Support both patterns:
  //  - /functions/v1/api/secours/...  => pathname starts with '/secours/...'
  //  - /functions/v1/api/api/secours/... => pathname starts with '/api/secours/...'
  const path = pathname.startsWith('/api/') ? pathname.slice(4) : pathname;

  // Global CORS preflight
  if (req.method === "OPTIONS") {
    return handleOptions(req);
  }

  // Normalize to "/api/..."
  if (path.startsWith("/payments/initiate-orange-money") && req.method === "POST") {
    return await initiateOrangeMoney(req);
  }
  if (path.startsWith("/payments/initiate-sama-money") && req.method === "POST") {
    return await initiateSamaMoney(req);
  }
  if (path.startsWith("/payments/verify") && req.method === "POST") {
    return await verifyPayment(req);
  }
  if (path.startsWith("/payments/cinetpay-webhook")) {
    return await cinetpayWebhook(req);
  }
  if (path.startsWith("/payments/orange-money-webhook")) {
    return await orangeWebhook(req);
  }

  // Ô SECOURS API
  if (path === "/secours/subscriptions" && req.method === "GET") {
    try {
      if (!supabase) return json({ success: false, message: "Supabase not configured" }, { status: 500 });
      const userId = url.searchParams.get("userId") || undefined;
      if (!userId) return json({ success: false, message: "Missing userId" }, { status: 400 });
      const { data, error } = await supabase
        .from("secours_subscriptions")
        .select("id, user_id, service_type, token_balance")
        .eq("user_id", userId);
      if (error) return json({ success: false, message: error.message }, { status: 500 });
      return json({ success: true, data });
    } catch (e: any) {
      return json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
    }
  }

  if (path === "/secours/transactions" && req.method === "GET") {
    try {
      if (!supabase) return json({ success: false, message: "Supabase not configured" }, { status: 500 });
      const subscriptionId = url.searchParams.get("subscriptionId") || undefined;
      const userId = url.searchParams.get("userId") || undefined;
      let query = supabase.from("secours_transactions").select("*, secours_subscriptions!inner(id, user_id, service_type)").order("created_at", { ascending: false });
      if (subscriptionId) {
        query = query.eq("subscription_id", subscriptionId);
      } else if (userId) {
        query = query.eq("secours_subscriptions.user_id", userId);
      } else {
        return json({ success: false, message: "Missing subscriptionId or userId" }, { status: 400 });
      }
      const { data, error } = await query;
      if (error) return json({ success: false, message: error.message }, { status: 500 });
      return json({ success: true, data });
    } catch (e: any) {
      return json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
    }
  }

  if (path === "/secours/requests" && req.method === "GET") {
    try {
      if (!supabase) return json({ success: false, message: "Supabase not configured" }, { status: 500 });
      const userId = url.searchParams.get("userId") || undefined;
      if (!userId) return json({ success: false, message: "Missing userId" }, { status: 400 });
      const { data, error } = await supabase
        .from("secours_rescue_requests")
        .select("*")
        .eq("user_id", userId)
        .order("request_date", { ascending: false });
      if (error) return json({ success: false, message: error.message }, { status: 500 });
      return json({ success: true, data });
    } catch (e: any) {
      return json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
    }
  }

  if (path === "/secours/requests" && req.method === "POST") {
    try {
      if (!supabase) return json({ success: false, message: "Supabase not configured" }, { status: 500 });
      const payload = await readJson<any>(req);
      const userId = payload?.userId || undefined;
      const serviceId = payload?.service_id;
      const tokens = Number(payload?.tokens_requested || 0);
      const description = String(payload?.description || "");
      if (!userId || !serviceId || !tokens) return json({ success: false, message: "Missing userId, service_id or tokens_requested" }, { status: 400 });

      // Find subscription for this user+service
      const { data: sub, error: subErr } = await supabase
        .from("secours_subscriptions")
        .select("id, token_balance")
        .eq("user_id", userId)
        .eq("service_type", serviceId)
        .maybeSingle();
      if (subErr) return json({ success: false, message: subErr.message }, { status: 500 });
      if (!sub?.id) return json({ success: false, message: "No subscription for this service" }, { status: 400 });
      if ((sub.token_balance || 0) < tokens) return json({ success: false, message: "Insufficient token balance" }, { status: 400 });

      const { data, error } = await supabase.from("secours_rescue_requests").insert({
        user_id: userId,
        subscription_id: sub.id,
        service_type: serviceId,
        request_description: description,
        rescue_value_fcfa: 0,
        status: "pending",
        request_date: new Date().toISOString(),
      } as any).select("*").maybeSingle();
      if (error) return json({ success: false, message: error.message }, { status: 500 });
      return json({ success: true, data });
    } catch (e: any) {
      return json({ success: false, message: e?.message || "Unexpected error" }, { status: 500 });
    }
  }

  return json({ ok: true, message: "API Function online", path });
});
