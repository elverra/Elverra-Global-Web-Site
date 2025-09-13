const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// Get user subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId parameter'
      });
    }

    const { data, error } = await supabase
      .from('secours_subscriptions')
      .select('id, user_id, plan, token_balance, status, created_at')
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Map plan to service_type for frontend compatibility
    const mapped = (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      service_type: row.plan,
      token_balance: row.token_balance,
      status: row.status,
      created_at: row.created_at
    }));

    res.json({
      success: true,
      data: mapped
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user transactions
router.get('/transactions', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.query;

    if (!subscriptionId && !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing subscriptionId or userId parameter'
      });
    }

    let query = supabase
      .from('secours_transactions')
      .select(`
        *,
        secours_subscriptions!inner(
          id,
          user_id,
          plan
        )
      `)
      .order('created_at', { ascending: false });

    if (subscriptionId) {
      query = query.eq('subscription_id', subscriptionId);
    } else if (userId) {
      query = query.eq('secours_subscriptions.user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Map plan to service_type for frontend compatibility
    const mapped = (data || []).map(row => ({
      ...row,
      secours_subscriptions: {
        ...row.secours_subscriptions,
        service_type: row.secours_subscriptions.plan
      }
    }));

    res.json({
      success: true,
      data: mapped
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user rescue requests
router.get('/requests', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId parameter'
      });
    }

    console.log('Fetching rescue requests for userId:', userId);
    
    const { data, error } = await supabase
      .from('secours_rescue_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create rescue request
router.post('/requests', async (req, res) => {
  try {
    const { userId, service_id, tokens_requested, description } = req.body;

    if (!userId || !service_id || !tokens_requested) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, service_id, tokens_requested'
      });
    }

    const tokens = Number(tokens_requested);
    if (tokens <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tokens_requested value'
      });
    }

    // Find subscription for this user+service
    const { data: sub, error: subError } = await supabase
      .from('secours_subscriptions')
      .select('id, token_balance')
      .eq('user_id', userId)
      .eq('plan', service_id)
      .maybeSingle();

    if (subError) {
      return res.status(500).json({
        success: false,
        message: subError.message
      });
    }

    if (!sub?.id) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found for this service'
      });
    }

    if ((sub.token_balance || 0) < tokens) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient token balance'
      });
    }

    // Create rescue request
    const { data, error } = await supabase
      .from('secours_rescue_requests')
      .insert({
        user_id: userId,
        subscription_id: sub.id,
        service_type: service_id,
        request_description: description || '',
        rescue_value_fcfa: 0, // Will be calculated later
        status: 'pending',
        request_date: new Date().toISOString()
      })
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create subscription
router.post('/subscriptions', async (req, res) => {
  try {
    const { userId, serviceType, initialTokens = 0 } = req.body;

    if (!userId || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, serviceType'
      });
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('secours_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('plan', serviceType)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Subscription already exists for this service'
      });
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('secours_subscriptions')
      .insert({
        user_id: userId,
        plan: serviceType,
        token_balance: initialTokens,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select('*')
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    // Map for frontend compatibility
    const mapped = {
      ...data,
      service_type: data.plan
    };

    res.json({
      success: true,
      data: mapped
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
