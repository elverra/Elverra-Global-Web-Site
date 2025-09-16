import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID requis' 
      });
    }

    let allTransactions = [];

    // 1. Get subscription payments
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!paymentsError && paymentsData) {
        const subscriptionPayments = paymentsData.map(payment => ({
          id: payment.id,
          type: 'subscription',
          amount: payment.amount,
          description: `Souscription ${payment.metadata?.tier || 'carte'} - ${payment.payment_method?.replace('_', ' ')}`,
          date: payment.created_at,
          category: 'Souscription',
          merchant: payment.payment_method === 'orange_money' ? 'Orange Money' : 
                    payment.payment_method === 'sama_money' ? 'SAMA Money' : 
                    payment.payment_method === 'cinetpay' ? 'CinetPay' : 'Paiement',
          status: payment.status,
          payment_method: payment.payment_method
        }));
        allTransactions.push(...subscriptionPayments);
      }
    } catch (error) {
      console.warn('Subscription payments query failed:', error);
    }

    // 2. Get token purchases (Ô Secours)
    try {
      const { data: tokenTransactions, error: tokenError } = await supabase
        .from('secours_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'purchase')
        .order('created_at', { ascending: false });

      if (!tokenError && tokenTransactions) {
        const tokenPayments = tokenTransactions.map(transaction => ({
          id: transaction.id,
          type: 'tokens',
          amount: transaction.total_amount,
          description: `Achat ${transaction.token_amount} tokens - ${transaction.description || 'Ô Secours'}`,
          date: transaction.created_at,
          category: 'Tokens Ô Secours',
          merchant: 'SAMA Money',
          status: 'completed',
          payment_method: 'sama_money'
        }));
        allTransactions.push(...tokenPayments);
      }
    } catch (error) {
      console.warn('Token transactions query failed:', error);
    }

    // 3. Get product posting payments
    try {
      const { data: productPayments, error: productError } = await supabase
        .from('products')
        .select('id, title, posting_fee_amount, posting_fee_reference, created_at')
        .eq('seller_id', userId)
        .eq('posting_fee_paid', true)
        .order('created_at', { ascending: false });

      if (!productError && productPayments) {
        const productFees = productPayments.map(product => ({
          id: product.id,
          type: 'product_posting',
          amount: product.posting_fee_amount || 500,
          description: `Frais publication - ${product.title}`,
          date: product.created_at,
          category: 'Publication Produit',
          merchant: 'SAMA Money',
          status: 'completed',
          payment_method: 'sama_money',
          reference: product.posting_fee_reference
        }));
        allTransactions.push(...productFees);
      }
    } catch (error) {
      console.warn('Product posting payments query failed:', error);
    }

    // Sort all transactions by date
    const sortedTransactions = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20); // Limit to 20 most recent transactions

    // Calculate total paid
    const totalPaid = allTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        transactions: sortedTransactions,
        totalPaid: totalPaid,
        transactionCount: allTransactions.length
      }
    });

  } catch (error) {
    console.error('Error in payment history endpoint:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur interne du serveur' 
    });
  }
}
