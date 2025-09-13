import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SAMA Money configuration
const SAMA_BASE_URL = process.env.SAMA_BASE_URL;
const SAMA_TRANSAC = process.env.SAMA_TRANSAC;
const SAMA_CMD = process.env.SAMA_CMD;
const SAMA_CLE_PUBLIQUE = process.env.SAMA_CLE_PUBLIQUE;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!SAMA_BASE_URL || !SAMA_TRANSAC || !SAMA_CMD || !SAMA_CLE_PUBLIQUE) {
  throw new Error('Missing SAMA Money environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, phone, productData } = req.body;

    if (!userId || !phone || !productData) {
      return res.status(400).json({ 
        success: false,
        message: 'Données manquantes: userId, téléphone et données produit requis' 
      });
    }

    // Validate phone number format
    if (!/^223\d{8}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Format de numéro incorrect. Utilisez le format: 22370445566'
      });
    }

    // Check if user has exceeded free product limit
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId);

    if (countError) {
      console.error('Error counting products:', countError);
      return res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la vérification du nombre de produits' 
      });
    }

    const productCount = count || 0;
    
    if (productCount < 10) {
      return res.status(400).json({
        success: false,
        message: `Vous avez encore ${10 - productCount} produits gratuits. Aucun paiement requis.`
      });
    }

    // Generate unique reference for payment
    const reference = `PRODUCT_${Date.now()}_${userId.substring(0, 8)}`;

    // Step 1: Get SAMA Money authentication token
    const authParams = new URLSearchParams({
      cmd: SAMA_CMD,
      cle_publique: SAMA_CLE_PUBLIQUE
    });

    console.log('SAMA Auth request for product payment:', {
      url: `${SAMA_BASE_URL}/marchand/auth`,
      headers: { 'TRANSAC': '***' },
      body: authParams.toString()
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
    console.log('SAMA Auth response for product payment:', authData);

    if (authData.status !== 1 || !authData.resultat?.token) {
      return res.status(500).json({
        success: false,
        message: 'Erreur d\'authentification SAMA Money. Veuillez réessayer.',
        errorCode: authData.status,
        details: authData
      });
    }

    const samaToken = authData.resultat.token;

    // Step 2: Initiate payment with Bearer token
    const payParams = new URLSearchParams({
      cmd: SAMA_CMD,
      idCommande: reference,
      phoneClient: phone,
      montant: '500',
      description: `Frais de publication produit - ${productData.title}`,
      url: process.env.FRONTEND_URL || 'https://elverraglobalml.com'
    });

    console.log('SAMA Pay request for product payment:', {
      url: `${SAMA_BASE_URL}/marchand/pay`,
      headers: { 'Authorization': `Bearer ${samaToken.substring(0, 10)}...`, 'TRANSAC': '***' },
      body: payParams.toString()
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
    console.log('SAMA Pay response for product payment:', payData);

    if (payData?.status !== 1) {
      // Map SAMA Money error codes to user-friendly messages
      const errorMsg = payData?.msg || '';
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
        errorCode: payData?.status,
        details: payData
      });
    }

    // Payment successful - create the product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert([{
        seller_id: userId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        condition: productData.condition,
        location: productData.location || null,
        contact_phone: productData.contact_phone || null,
        contact_email: productData.contact_email || null,
        posting_fee_paid: true,
        posting_fee_amount: 500,
        posting_fee_reference: reference,
        is_active: true,
        is_sold: false,
        views: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (productError) {
      console.error('Error creating product after payment:', productError);
      return res.status(500).json({
        success: false,
        message: 'Paiement réussi mais erreur lors de la création du produit. Contactez le support.',
        paymentReference: reference
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Paiement réussi! Votre produit est maintenant en ligne.',
      product: newProduct,
      paymentReference: reference,
      paymentDetails: payData
    });

  } catch (error) {
    console.error('Error in product payment endpoint:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur' 
    });
  }
}
