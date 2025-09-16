const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/client/billing
router.get('/billing', async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Billing API - Processing request for userId:', userId);

    // Get user's subscriptions (child + adult). Actual schema: product_id, status, start_date, end_date, is_recurring, metadata, is_child
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, user_id, product_id, status, start_date, end_date, is_child')
      .eq('user_id', userId);

    console.log('Billing API - Raw subscriptions from DB:', subscriptions);
    console.log('Billing API - Subscription error:', subscriptionError);

    if (subscriptionError) {
      console.error('Billing API - Subscription query failed:', subscriptionError);
      throw subscriptionError;
    }

    // Get user profile for address and name - handle permission errors gracefully
    let userProfile = null;
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile query failed, using fallback:', profileError.message);
      } else {
        userProfile = profile;
      }
    } catch (err) {
      console.warn('Profile access denied, using fallback data:', err.message);
      userProfile = null;
    }

    // Get user's payment history for subscription
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .in('payment_method', ['orange_money', 'sama_money', 'stripe'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      throw paymentsError;
    }

    // Resolve product info for subscriptions (to detect adult tier) and fetch membership_cards for visual card data
    const subIds = subscriptions?.map(s => s.id) || [];
    const productIds = [...new Set((subscriptions || []).map(s => s.product_id).filter(Boolean))];

    let productsById = {};
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('membership_products')
        .select('id, name')
        .in('id', productIds);
      (products || []).forEach(p => { productsById[p.id] = p; });
    }

    let cardsRows = [];
    if (subIds.length > 0) {
      const { data: mCards } = await supabase
        .from('membership_cards')
        .select('id, card_identifier, holder_full_name, holder_city, owner_user_id, subscription_id, product_id, status, issued_at, card_expiry_date, qr_data')
        .eq('owner_user_id', userId)
        .in('subscription_id', subIds);
      cardsRows = mCards || [];
    }

    // Helper to infer adult tier from product name
    const inferTier = (name) => {
      const n = (name || '').toLowerCase();
      if (n.includes('premium')) return 'premium';
      if (n.includes('elite')) return 'elite';
      return 'essential';
    };

    const cards = [];
    // Child card
    const childSub = (subscriptions || []).find(s => s.is_child === true);
    console.log('Billing API - Child subscription found:', childSub);
    if (childSub) {
      const card = cardsRows.find(c => c.subscription_id === childSub.id);
      cards.push({
        cardNumber: card?.card_identifier ? `**** **** **** ${card.card_identifier.slice(-4)}` : `**** **** **** ${userId.slice(-4)}`,
        expiryDate: card?.card_expiry_date ? new Date(card.card_expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : (childSub.end_date ? new Date(childSub.end_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25'),
        cardType: 'child',
        status: (card?.status || childSub.status) === 'active' ? 'Active' : 'Inactive',
        issueDate: card?.issued_at || childSub.start_date || new Date().toISOString().split('T')[0],
        lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
        holderName: card?.holder_full_name || userProfile?.full_name || 'Client',
        address: card?.holder_city || userProfile?.city || 'Bamako, Mali',
        qrCodeData: JSON.stringify(card?.qr_data || { clientId: userId, cardType: 'child', status: childSub.status, expiryDate: childSub.end_date, holderName: userProfile?.full_name || 'Client' })
      });
    }

    // Adult card (single variant) - treat any non-true as adult to handle null/undefined
    const adultSub = (subscriptions || []).find(s => s.is_child !== true);
    console.log('Billing API - Adult subscription found:', adultSub);
    if (adultSub) {
      const card = cardsRows.find(c => c.subscription_id === adultSub.id);
      const productName = productsById[adultSub.product_id]?.name || '';
      const tier = inferTier(productName);
      cards.push({
        cardNumber: card?.card_identifier ? `**** **** **** ${card.card_identifier.slice(-4)}` : `**** **** **** ${userId.slice(-4)}`,
        expiryDate: card?.card_expiry_date ? new Date(card.card_expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : (adultSub.end_date ? new Date(adultSub.end_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25'),
        cardType: tier,
        status: (card?.status || adultSub.status) === 'active' ? 'Active' : 'Inactive',
        issueDate: card?.issued_at || adultSub.start_date || new Date().toISOString().split('T')[0],
        lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
        holderName: card?.holder_full_name || userProfile?.full_name || 'Client',
        address: card?.holder_city || userProfile?.city || 'Bamako, Mali',
        qrCodeData: JSON.stringify(card?.qr_data || { clientId: userId, cardType: 'adult', plan: tier, status: adultSub.status, expiryDate: adultSub.end_date, holderName: userProfile?.full_name || 'Client' })
      });
    }

    // Default when no subs found
    if (cards.length === 0) {
      cards.push({
        cardNumber: `**** **** **** ${userId.slice(-4)}`,
        expiryDate: '12/25',
        cardType: 'essential',
        status: 'Inactive',
        issueDate: new Date().toISOString().split('T')[0],
        lastTransactionDate: new Date().toISOString().split('T')[0],
        holderName: userProfile?.full_name || 'Client',
        address: userProfile?.city || 'Bamako, Mali',
        qrCodeData: JSON.stringify({ clientId: userId, cardType: 'adult', plan: 'essential', status: 'inactive', expiryDate: null, holderName: userProfile?.full_name || 'Client' })
      });
    }

    // Format transactions for display
    const formattedTransactions = payments?.map(payment => ({
      id: payment.id,
      type: payment.status === 'completed' ? 'debit' : 'pending',
      amount: payment.amount,
      description: `${(payment.payment_method || 'payment').replace('_', ' ')}${payment.metadata?.label ? ` - ${payment.metadata.label}` : payment.metadata?.tier ? ` - ${payment.metadata.tier}` : ''}`,
      date: payment.created_at.split('T')[0],
      category: 'Subscription',
      merchant: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                payment.payment_method === 'sama_money' ? 'SAMA Money' : 'Card Payment',
      status: payment.status
    })) || [];

    // Calculate billing summary
    const totalPaid = payments?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
    console.log('Billing API - Active subscriptions:', activeSubscriptions);
    const nextBillingDate = activeSubscriptions.length > 0 ? 
      Math.min(...activeSubscriptions.map(sub => new Date(sub.end_date).getTime())) : null;
    const isExpiringSoon = nextBillingDate ? 
      new Date(nextBillingDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

    return res.status(200).json({
      success: true,
      data: {
        cards, // Return array of cards instead of single cardData
        transactions: formattedTransactions,
        billing: {
          totalPaid,
          nextBillingDate: nextBillingDate ? new Date(nextBillingDate).toISOString() : null,
          isExpiringSoon,
          activeSubscriptions: activeSubscriptions.length,
          subscriptions: subscriptions || []
        }
      }
    });

  } catch (error) {
    console.error('Error fetching client billing data:', error);
    console.error('Full error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch client billing data',
      details: error.message,
      userId: req.query.userId 
    });
  }
});

module.exports = router;
