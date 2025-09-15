import { createClient } from '@supabase/supabase-js';
import { handleActivate } from './activate';
import { handleUpdate } from './update';

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

  const { method, url } = req;
  const path = url.split('?')[0];

  try {
    // Handle different subscription routes
    switch (path) {
      case '/api/subscriptions/activate':
        return await handleActivate(req, res, { supabase });
      case '/api/subscriptions/update':
        return await handleUpdate(req, res, { supabase });
      case '/api/subscriptions':
        if (method === 'POST') {
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
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
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

          return res.status(201).json({ 
            success: true, 
            data,
            message: 'Subscription created successfully' 
          });
        }
        break;
      
      default:
        return res.status(404).json({ 
          success: false, 
          message: 'Route not found' 
        });
    }
  } catch (error) {
    console.error('Subscription API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
