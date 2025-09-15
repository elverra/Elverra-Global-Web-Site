export async function handleUpdate(req, res, { supabase }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { subscriptionId, status } = req.body;

    if (!subscriptionId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'subscriptionId and status are required' 
      });
    }

    if (!['active', 'inactive', 'cancelled', 'pending'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be one of: active, inactive, cancelled, pending' 
      });
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update subscription status',
        error: error.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
