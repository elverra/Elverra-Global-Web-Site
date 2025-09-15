export async function handleActivate(req, res, { supabase }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { subscriptionId, userId, plan } = req.body;

    if (!subscriptionId || !userId || !plan) {
      return res.status(400).json({ 
        success: false, 
        message: 'subscriptionId, userId, and plan are required' 
      });
    }

    // Activate subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error activating subscription:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to activate subscription',
        error: error.message 
      });
    }

    // Update user membership tier
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        membership_tier: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user tier:', userError);
      // Don't fail the request, subscription is activated successfully
    }

    return res.status(200).json({ 
      success: true, 
      data: subscription
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
