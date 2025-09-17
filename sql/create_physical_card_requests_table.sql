-- Create physical card requests table
CREATE TABLE IF NOT EXISTS physical_card_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User information snapshot at time of request
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Mali',
    
    -- Card information
    membership_tier VARCHAR(20) NOT NULL, -- 'essential', 'premium', 'elite', 'child'
    card_identifier VARCHAR(20) NOT NULL,
    
    -- Request status
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
        'pending_payment',
        'payment_completed', 
        'card_ordered',
        'card_printed',
        'card_shipped',
        'card_delivered',
        'cancelled'
    )),
    
    -- Payment information
    payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery information
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_country VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, card_identifier)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_physical_card_requests_user_id ON physical_card_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_physical_card_requests_status ON physical_card_requests(status);
CREATE INDEX IF NOT EXISTS idx_physical_card_requests_payment_ref ON physical_card_requests(payment_reference);
CREATE INDEX IF NOT EXISTS idx_physical_card_requests_created_at ON physical_card_requests(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_physical_card_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_physical_card_requests_updated_at
    BEFORE UPDATE ON physical_card_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_physical_card_requests_updated_at();

-- Add RLS policies
ALTER TABLE physical_card_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own physical card requests" ON physical_card_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create own physical card requests" ON physical_card_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests (for status changes)
CREATE POLICY "Users can update own physical card requests" ON physical_card_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy for full access (you'll need to create an admin role)
-- CREATE POLICY "Admins can manage all physical card requests" ON physical_card_requests
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add comments
COMMENT ON TABLE physical_card_requests IS 'Stores requests for physical membership cards with payment tracking';
COMMENT ON COLUMN physical_card_requests.status IS 'Tracks the lifecycle of physical card requests from payment to delivery';
COMMENT ON COLUMN physical_card_requests.card_identifier IS 'The unique card identifier in format ML25-XXXXXXXXX-01';
