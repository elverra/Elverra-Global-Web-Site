import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user's subscription information (can have multiple: child card + adult card variants)
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Get user profile for address and name
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
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

    // Generate card data for each subscription (child card + adult card variants)
    const cards = [];
    
    // Check for child card (unique, no variants)
    const childCard = subscriptions?.find(sub => sub.card_type === 'child');
    if (childCard) {
      cards.push({
        cardNumber: childCard.member_id ? `**** **** **** ${childCard.member_id.slice(-4)}` : `**** **** **** ${userId.slice(-4)}`,
        expiryDate: childCard.expiry_date ? new Date(childCard.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25',
        cardType: 'child',
        status: childCard.is_active ? 'Active' : 'Inactive',
        issueDate: childCard.start_date || new Date().toISOString().split('T')[0],
        lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
        holderName: userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Client',
        address: userProfile?.address || 'Bamako, Mali',
        qrCodeData: JSON.stringify({
          clientId: userId,
          cardType: 'child',
          status: childCard.is_active ? 'active' : 'inactive',
          expiryDate: childCard.expiry_date,
          holderName: userProfile?.full_name || 'Client'
        })
      });
    }
    
    // Check for adult card (can have variants: essential, premium, elite)
    const adultCard = subscriptions?.find(sub => sub.card_type === 'adult' || !sub.card_type);
    if (adultCard) {
      cards.push({
        cardNumber: adultCard.member_id ? `**** **** **** ${adultCard.member_id.slice(-4)}` : `**** **** **** ${userId.slice(-4)}`,
        expiryDate: adultCard.expiry_date ? new Date(adultCard.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25',
        cardType: adultCard.tier || 'essential',
        status: adultCard.is_active ? 'Active' : 'Inactive',
        issueDate: adultCard.start_date || new Date().toISOString().split('T')[0],
        lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0],
        holderName: userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Client',
        address: userProfile?.address || 'Bamako, Mali',
        qrCodeData: JSON.stringify({
          clientId: userId,
          cardType: 'adult',
          plan: adultCard.tier || 'essential',
          status: adultCard.is_active ? 'active' : 'inactive',
          expiryDate: adultCard.expiry_date,
          holderName: userProfile?.full_name || 'Client'
        })
      });
    }
    
    // If no cards exist, return default adult essential card structure
    if (cards.length === 0) {
      cards.push({
        cardNumber: `**** **** **** ${userId.slice(-4)}`,
        expiryDate: '12/25',
        cardType: 'essential',
        status: 'Inactive',
        issueDate: new Date().toISOString().split('T')[0],
        lastTransactionDate: new Date().toISOString().split('T')[0],
        holderName: userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Client',
        address: userProfile?.address || 'Bamako, Mali',
        qrCodeData: JSON.stringify({
          clientId: userId,
          cardType: 'adult',
          plan: 'essential',
          status: 'inactive',
          expiryDate: null,
          holderName: userProfile?.full_name || 'Client'
        })
      });
    }

    // Format transactions for display
    const formattedTransactions = payments?.map(payment => ({
      id: payment.id,
      type: payment.status === 'completed' ? 'debit' : 'pending',
      amount: payment.amount,
      description: payment.description || `${payment.payment_method} Payment`,
      date: payment.created_at.split('T')[0],
      category: 'Subscription',
      merchant: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                payment.payment_method === 'sama_money' ? 'SAMA Money' : 'Card Payment',
      status: payment.status
    })) || [];

    // Calculate billing summary
    const totalPaid = payments?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const activeSubscriptions = subscriptions?.filter(sub => sub.is_active) || [];
    const nextBillingDate = activeSubscriptions.length > 0 ? 
      Math.min(...activeSubscriptions.map(sub => new Date(sub.expiry_date).getTime())) : null;
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
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch client billing data',
      details: error.message 
    });
  }
}
