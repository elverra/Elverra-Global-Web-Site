export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference, amount, userId, metadata } = req.body;

    if (!reference || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing reference or amount'
      });
    }

    const { ORANGE_BASIC_AUTH, ORANGE_MERCHANT_KEY, ORANGE_ENV } = process.env;
    
    if (!ORANGE_BASIC_AUTH || !ORANGE_MERCHANT_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Orange Money not configured'
      });
    }

    // Step 1: Get OAuth token
    const tokenResponse = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${ORANGE_BASIC_AUTH}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData?.access_token;
    if (!accessToken) {
      return res.status(502).json({
        success: false,
        message: 'Failed to get Orange access token',
        details: tokenData
      });
    }

    // Step 2: Create WebPayment
    const baseUrl = ORANGE_ENV === 'prod' ? 
      'https://api.orange.com/orange-money-webpay/v1' : 
      'https://api.orange.com/orange-money-webpay/dev/v1';

    const paymentResponse = await fetch(`${baseUrl}/webpayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        merchant_key: ORANGE_MERCHANT_KEY,
        currency: ORANGE_ENV === 'prod' ? 'XOF' : 'OUV',
        order_id: reference,
        amount: String(amount),
        return_url: process.env.ORANGE_RETURN_URL,
        cancel_url: process.env.ORANGE_CANCEL_URL,
        notif_url: process.env.ORANGE_NOTIF_URL,
        lang: 'fr',
        reference: reference
      })
    });

    const paymentData = await paymentResponse.json();

    res.json({
      success: true,
      paymentUrl: paymentData?.payment_url,
      payToken: paymentData?.pay_token,
      data: paymentData
    });

  } catch (error) {
    console.error('Orange Money error:', error.message);
    res.status(502).json({
      success: false,
      message: 'Orange Money payment failed',
      details: error.message
    });
  }
}
