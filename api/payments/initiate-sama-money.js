export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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

    const authResponse = await fetch(`${SAMA_BASE_URL}/marchand/auth`, {
      method: 'POST',
      headers: {
        'TRANSAC': SAMA_TRANSAC,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: authParams.toString()
    });

    const authData = await authResponse.json();
    if (authData?.status !== 1) {
      return res.status(502).json({
        success: false,
        message: 'SAMA auth failed',
        details: authData
      });
    }

    const samaToken = authData?.resultat?.token;
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

    const payResponse = await fetch(`${SAMA_BASE_URL}/marchand/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${samaToken}`,
        'TRANSAC': SAMA_TRANSAC,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payParams.toString()
    });

    const payData = await payResponse.json();
    if (payData?.status !== 1) {
      // Map SAMA Money error messages to user-friendly messages
      const errorMsg = payData?.msg || '';
      let userMessage = 'Échec du paiement SAMA Money';
      
      if (errorMsg.includes('Solde insuffisant')) {
        userMessage = 'Solde insuffisant sur votre compte SAMA Money. Veuillez recharger votre compte et réessayer.';
      } else if (errorMsg.includes('n\'existe pas')) {
        userMessage = 'Ce numéro de téléphone n\'est pas enregistré sur SAMA Money.';
      } else if (errorMsg.includes('Token')) {
        userMessage = 'Session expirée, veuillez réessayer.';
      } else if (errorMsg.includes('format')) {
        userMessage = 'Format de données incorrect. Veuillez vérifier vos informations.';
      } else if (errorMsg.includes('autorisé')) {
        userMessage = 'Transaction non autorisée.';
      }

      return res.status(400).json({
        success: false,
        message: userMessage,
        errorCode: payData?.status,
        details: payData
      });
    }

    res.json({
      success: true,
      initiated: true,
      reference,
      data: payData
    });

  } catch (error) {
    console.error('SAMA Money error:', error.message);
    res.status(502).json({
      success: false,
      message: 'SAMA Money payment failed',
      details: error.message
    });
  }
}
