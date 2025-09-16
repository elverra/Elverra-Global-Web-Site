// Environment variables required:
// - WHATSAPP_TOKEN
// - WHATSAPP_PHONE_NUMBER_ID
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[notifications/whatsapp] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
  console.warn('[notifications/whatsapp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID env vars');
}

async function sendWhatsAppAudio({ to, audioUrl }) {
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'audio',
    audio: { link: audioUrl },
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`WhatsApp API error: ${resp.status} ${text}`);
  }
  return resp.json();
}

async function updateRequestStatus({ id, status }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { skipped: true };
  const url = `${SUPABASE_URL}/rest/v1/lawyer_requests?id=eq.${encodeURIComponent(id)}`;
  const payload = [{ status, notification_sent_at: new Date().toISOString() }];
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Supabase REST error: ${resp.status} ${text}`);
  }
  return resp.json();
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { requestId, audioUrl, phones } = req.body || {};

    if (!requestId || !audioUrl || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: requestId, audioUrl, phones[]'
      });
    }

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      return res.status(500).json({
        success: false,
        message: 'WhatsApp API env vars not configured (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID)'
      });
    }

    // Send WhatsApp audio to each recipient sequentially to simplify error handling
    const results = [];
    for (const raw of phones) {
      const to = String(raw).replace(/^\+/, ''); // WA Cloud API accepts without leading + in many cases
      try {
        const r = await sendWhatsAppAudio({ to, audioUrl });
        results.push({ to: raw, ok: true, response: r });
      } catch (err) {
        results.push({ to: raw, ok: false, error: err.message });
      }
    }

    // Decide global success: at least one success
    const anySuccess = results.some(r => r.ok);

    // Update DB status using Supabase REST and service role
    const status = anySuccess ? 'sent' : 'send_error';
    try {
      await updateRequestStatus({ id: requestId, status });
    } catch (e) {
      console.error('[notifications/whatsapp] DB update error:', e);
    }

    if (!anySuccess) {
      return res.status(502).json({ success: false, message: 'All WhatsApp sends failed', results });
    }

    return res.status(200).json({ success: true, message: 'WhatsApp message(s) sent', results });
  } catch (error) {
    console.error('[notifications/whatsapp] Handler error:', error);
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};
