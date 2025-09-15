import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { userId, plan, status } = req.body;

      if (!userId || !plan) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId and plan are required' 
        });
      }

      // Create subscription record
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          plan: plan,
          status: status || 'pending',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          is_recurring: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create subscription',
          error: error.message 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data,
        id: data.id
      });

    } else if (req.method === 'GET') {
      // Get userId from Authorization header or query parameter
      let userId = req.query.userId;
      
      if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          userId = authHeader.substring(7);
        }
      }

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'userId is required' 
        });
      }

      // Get active subscription for the user
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch subscription',
          error: error.message 
        });
      }

      if (!data) {
        return res.status(404).json({ 
          success: false, 
          message: 'No active subscription found' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        subscription: data
      });

    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
