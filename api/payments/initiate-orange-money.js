const axios = require('axios');

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
    const tokenResponse = await axios.post('https://api.orange.com/oauth/v3/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${ORANGE_BASIC_AUTH}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      return res.status(502).json({
        success: false,
        message: 'Failed to get Orange access token'
      });
    }

    // Step 2: Create WebPayment
    const baseUrl = ORANGE_ENV === 'prod' ? 
      'https://api.orange.com/orange-money-webpay/v1' : 
      'https://api.orange.com/orange-money-webpay/dev/v1';

    const paymentResponse = await axios.post(`${baseUrl}/webpayment`, {
      merchant_key: ORANGE_MERCHANT_KEY,
      currency: ORANGE_ENV === 'prod' ? 'XOF' : 'OUV',
      order_id: reference,
      amount: String(amount),
      return_url: process.env.ORANGE_RETURN_URL,
      cancel_url: process.env.ORANGE_CANCEL_URL,
      notif_url: process.env.ORANGE_NOTIF_URL,
      lang: 'fr',
      reference: reference
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    res.json({
      success: true,
      paymentUrl: paymentResponse.data?.payment_url,
      payToken: paymentResponse.data?.pay_token,
      data: paymentResponse.data
    });

  } catch (error) {
    console.error('Orange Money error:', error.response?.data || error.message);
    res.status(502).json({
      success: false,
      message: 'Orange Money payment failed',
      details: error.response?.data || error.message
    });
  }
}
