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
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Count total products created by user
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId);

    if (error) {
      console.error('Error counting products:', error);
      return res.status(500).json({ error: 'Failed to count products' });
    }

    const productCount = count || 0;
    const freeProductsUsed = Math.min(productCount, 10);
    const freeProductsRemaining = Math.max(0, 10 - productCount);
    const requiresPayment = productCount >= 10;

    return res.status(200).json({
      success: true,
      data: {
        totalProducts: productCount,
        freeProductsUsed,
        freeProductsRemaining,
        requiresPayment,
        nextProductFee: requiresPayment ? 500 : 0
      }
    });

  } catch (error) {
    console.error('Error in product count endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
