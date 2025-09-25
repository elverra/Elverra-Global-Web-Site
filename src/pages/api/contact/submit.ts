import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, subject, message, inquiryType } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to database
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          subject,
          message,
          inquiry_type: inquiryType || 'general',
          status: 'new'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving contact submission:', error);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    // In a real app, you might want to send an email notification here
    // await sendEmailNotification(data);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
