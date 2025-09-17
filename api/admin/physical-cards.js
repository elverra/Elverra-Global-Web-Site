const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get all physical card requests with optional filtering
const getPhysicalCardRequests = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('physical_card_requests')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,card_identifier.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching physical card requests:', error);
      return res.status(500).json({ error: 'Failed to fetch physical card requests' });
    }

    res.json({
      success: true,
      data: data || [],
      count,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });
  } catch (error) {
    console.error('Error in getPhysicalCardRequests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get physical card request statistics
const getPhysicalCardStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('physical_card_requests')
      .select('status, payment_status, payment_amount');

    if (error) {
      console.error('Error fetching physical card stats:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    const stats = {
      total: data.length,
      pending_payment: data.filter(r => r.status === 'pending_payment').length,
      payment_confirmed: data.filter(r => r.status === 'payment_confirmed').length,
      card_ordered: data.filter(r => r.status === 'card_ordered').length,
      card_shipped: data.filter(r => r.status === 'card_shipped').length,
      delivered: data.filter(r => r.status === 'delivered').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      total_revenue: data
        .filter(r => r.payment_status === 'completed')
        .reduce((sum, r) => sum + (r.payment_amount || 0), 0)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in getPhysicalCardStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update physical card request status
const updatePhysicalCardRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, notes, payment_status } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending_payment', 'payment_confirmed', 'card_ordered', 'card_shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (notes !== undefined) updateData.notes = notes;
    if (payment_status !== undefined) updateData.payment_status = payment_status;

    const { data, error } = await supabase
      .from('physical_card_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating physical card request:', error);
      return res.status(500).json({ error: 'Failed to update request' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Physical card request not found' });
    }

    res.json({
      success: true,
      message: 'Physical card request updated successfully',
      data
    });
  } catch (error) {
    console.error('Error in updatePhysicalCardRequest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single physical card request by ID
const getPhysicalCardRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const { data, error } = await supabase
      .from('physical_card_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching physical card request:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Physical card request not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch request' });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getPhysicalCardRequest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Bulk update multiple physical card requests
const bulkUpdatePhysicalCardRequests = async (req, res) => {
  try {
    const { request_ids, status, notes } = req.body;

    if (!request_ids || !Array.isArray(request_ids) || request_ids.length === 0) {
      return res.status(400).json({ error: 'Request IDs array is required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Validate status
    const validStatuses = ['pending_payment', 'payment_confirmed', 'card_ordered', 'card_shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('physical_card_requests')
      .update(updateData)
      .in('id', request_ids)
      .select();

    if (error) {
      console.error('Error bulk updating physical card requests:', error);
      return res.status(500).json({ error: 'Failed to update requests' });
    }

    res.json({
      success: true,
      message: `Successfully updated ${data.length} physical card requests`,
      data
    });
  } catch (error) {
    console.error('Error in bulkUpdatePhysicalCardRequests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPhysicalCardRequests,
  getPhysicalCardStats,
  updatePhysicalCardRequest,
  getPhysicalCardRequest,
  bulkUpdatePhysicalCardRequests
};
