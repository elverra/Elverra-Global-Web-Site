const express = require('express');
const axios = require('axios');
const supabase = require('../config/supabase');
const router = express.Router();

// Token values mapping
const TOKEN_VALUES = {
  auto: 750,
  cata_catanis: 500,
  school_fees: 500,
  motors: 250,
  telephone: 250,
  first_aid: 500
};

// Record payment attempt for webhook reconciliation
async function recordAttempt(data) {
  try {
    await supabase.from('secours_payment_attempts').insert({
      reference: data.reference,
      user_id: data.userId || null,
      service_type: data.serviceType || null,
      tokens: data.tokens || null,
      amount_fcfa: data.amountFcfa,
      method: data.method,
      status: 'pending',
      gateway_data: data.gatewayData || null,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording payment attempt:', error);
  }
}

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

// Orange Money - Initiate payment
router.post('/initiate-orange-money', async (req, res) => {
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

    // Record attempt
    await recordAttempt({
      reference,
      userId,
      serviceType: metadata?.serviceType,
      tokens: metadata?.tokens,
      amountFcfa: amount,
      method: 'orange_money',
      gatewayData: paymentResponse.data
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
});

// SAMA Money - Initiate payment
router.post('/initiate-sama-money', async (req, res) => {
  try {
    const { reference, amount, phone, userId, metadata, description, url } = req.body;

    if (!reference || !amount || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing reference, amount or phone'
      });
    }

    const { SAMA_BASE_URL, SAMA_TRANSAC, SAMA_CMD, SAMA_CLE_PUBLIQUE } = process.env;

    if (!SAMA_TRANSAC || !SAMA_CLE_PUBLIQUE) {
      return res.status(500).json({
        success: false,
        message: 'SAMA Money not configured'
      });
    }

    // Step 1: Get authentication token
    const authParams = new URLSearchParams({
      cmd: SAMA_CMD,
      cle_publique: SAMA_CLE_PUBLIQUE
    });

    console.log('SAMA Auth NEW request:', {
      url: `${SAMA_BASE_URL}/marchand/auth`,
      headers: { 'TRANSAC': SAMA_TRANSAC ? '***' : 'missing' },
      body: authParams.toString()
    });

    const authResponse = await axios.post(`${SAMA_BASE_URL}/marchand/auth`, authParams, {
      headers: {
        'TRANSAC': SAMA_TRANSAC,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('SAMA Auth NEW response:', authResponse.data);

    if (authResponse.data?.status !== 1) {
      return res.status(502).json({
        success: false,
        message: 'SAMA auth failed',
        details: authResponse.data
      });
    }

    const samaToken = authResponse.data?.resultat?.token;
    if (!samaToken) {
      return res.status(502).json({
        success: false,
        message: 'SAMA token missing'
      });
    }

    // Step 2: Initiate payment with Bearer token
    const payParams = new URLSearchParams({
      cmd: SAMA_CMD,
      idCommande: reference,
      phoneClient: phone,
      montant: String(Math.trunc(amount)),
      description: description || 'Ô Secours token purchase',
      url: url || process.env.FRONTEND_URL || 'https://elverraglobal.com'
    });

    console.log('SAMA Pay request:', {
      url: `${SAMA_BASE_URL}/marchand/pay`,
      headers: { 'Authorization': `Bearer ${samaToken.substring(0, 10)}...`, 'TRANSAC': '***' },
      body: payParams.toString()
    });

    const payResponse = await axios.post(`${SAMA_BASE_URL}/marchand/pay`, payParams, {
      headers: {
        'Authorization': `Bearer ${samaToken}`,
        'TRANSAC': SAMA_TRANSAC,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('SAMA Pay response:', payResponse.data);

    if (payResponse.data?.status !== 1) {
      // Map SAMA Money error codes to user-friendly messages
      const errorMessages = {
        1001: 'Vous n\'êtes pas autorisé à effectuer cette transaction',
        1002: 'Code marchand incorrect',
        1003: 'Codes fournis incorrects',
        1004: 'Format du token incorrect',
        1005: 'Format du montant incorrect',
        1006: 'Numéro de téléphone incorrect ou inexistant sur SAMA Money',
        1007: 'Description incorrecte',
        1008: 'URL de callback incorrecte',
        1009: 'Token expiré, veuillez réessayer',
        1010: 'Ce numéro n\'est pas un client SAMA Money',
        1011: 'Ce numéro de commande existe déjà',
        1012: 'Utilisateur pas dans le bon groupe',
        1013: 'Solde insuffisant sur votre compte SAMA Money',
        1014: 'Problème de lancement USSD',
        1015: 'Demande non envoyée, merci de recommencer'
      };

      // Check if the error message contains specific error indicators
      const errorMsg = payResponse.data?.msg || '';
      let userMessage = 'Échec du paiement SAMA Money';
      
      if (errorMsg.includes('Solde insuffisant')) {
        userMessage = 'Solde insuffisant sur votre compte SAMA Money. Veuillez recharger votre compte et réessayer.';
      } else if (errorMsg.includes('n\'existe pas')) {
        userMessage = 'Ce numéro de téléphone n\'est pas enregistré sur SAMA Money.';
      } else if (errorMsg.includes('Token')) {
        userMessage = 'Session expirée, veuillez réessayer.';
      }

      return res.status(400).json({
        success: false,
        message: userMessage,
        errorCode: payResponse.data?.status,
        details: payResponse.data
      });
    }

    // Record attempt
    await recordAttempt({
      reference,
      userId,
      serviceType: metadata?.serviceType,
      tokens: metadata?.tokens,
      amountFcfa: amount,
      method: 'sama_money',
      gatewayData: payResponse.data
    });

    res.json({
      success: true,
      initiated: true,
      reference,
      data: payResponse.data
    });

  } catch (error) {
    console.error('SAMA Money error:', error.response?.data || error.message);
    console.error('SAMA Money full error:', error);
    res.status(502).json({
      success: false,
      message: 'SAMA Money payment failed',
      details: error.response?.data || error.message
    });
  }
});

// Verify payment (SAMA Money)
router.post('/verify', async (req, res) => {
  try {
    const { reference, gateway = 'sama_money' } = req.body;

    if (gateway === 'sama_money') {
      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Missing reference'
        });
      }

      const { SAMA_BASE_URL, SAMA_TRANSAC, SAMA_CMD } = process.env;

      const infoParams = new URLSearchParams({
        cmd: SAMA_CMD,
        idCommande: reference
      });

      const infoResponse = await axios.post(`${SAMA_BASE_URL}/marchand/transaction/infos`, infoParams, {
        headers: {
          'TRANSAC': SAMA_TRANSAC,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const status = infoResponse.data?.status === 1 ? 'completed' : 
                   infoResponse.data?.status === 0 ? 'pending' : 'failed';

      res.json({
        success: true,
        status,
        data: infoResponse.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Gateway verification not implemented'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    res.status(502).json({
      success: false,
      message: 'Payment verification failed',
      details: error.response?.data || error.message
    });
  }
});

// Orange Money webhook
router.post('/orange-money-webhook', async (req, res) => {
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
});

// CinetPay webhook
router.post('/cinetpay-webhook', async (req, res) => {
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
});

module.exports = router;
