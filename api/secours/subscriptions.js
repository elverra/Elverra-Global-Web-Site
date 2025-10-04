import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    const { data, error } = await supabase
      .from('secours_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
