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

    // Get user's membership information
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      throw membershipError;
    }

    // Get user's payment history for membership
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

    // Get user's subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    // Calculate card data
    const cardData = {
      cardNumber: membership?.member_id ? `**** **** **** ${membership.member_id.slice(-4)}` : '**** **** **** ****',
      expiryDate: membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '12/25',
      cardType: membership?.tier || 'essential',
      status: membership?.is_active ? 'Active' : 'Inactive',
      issueDate: membership?.start_date || new Date().toISOString().split('T')[0],
      lastTransactionDate: payments?.[0]?.created_at || new Date().toISOString().split('T')[0]
    };

    // Format transactions for display
    const formattedTransactions = payments?.map(payment => ({
      id: payment.id,
      type: payment.status === 'completed' ? 'debit' : 'pending',
      amount: payment.amount,
      description: payment.description || `${payment.payment_method} Payment`,
      date: payment.created_at.split('T')[0],
      category: 'Membership',
      merchant: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                payment.payment_method === 'sama_money' ? 'SAMA Money' : 'Card Payment',
      status: payment.status
    })) || [];

    // Calculate billing summary
    const totalPaid = payments?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0) || 0;

    const nextBillingDate = membership?.expiry_date || null;
    const isExpiringSoon = nextBillingDate ? 
      new Date(nextBillingDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

    return res.status(200).json({
      success: true,
      data: {
        cardData,
        transactions: formattedTransactions,
        billing: {
          totalPaid,
          nextBillingDate,
          isExpiringSoon,
          currentPlan: membership?.tier || 'essential',
          subscriptions: subscriptions || []
        }
      }
    });

  } catch (error) {
    console.error('Error fetching billing data:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch billing data',
      details: error.message 
    });
  }
}
