import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Fetch all physical card requests
      const { data, error } = await supabase
        .from('physical_card_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    }

    if (req.method === 'PUT') {
      // Update a physical card request
      const { id, status, tracking_number, notes } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Request ID is required' });
      }

      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (tracking_number) updateData.tracking_number = tracking_number;
      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('physical_card_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Create a new physical card request
      const requestData = req.body;

      const { data, error } = await supabase
        .from('physical_card_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      // Delete a physical card request
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Request ID is required' });
      }

      const { error } = await supabase
        .from('physical_card_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Request deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
