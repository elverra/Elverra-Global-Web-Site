-- Clean and recreate physical_card_requests table with proper RLS policies

-- Drop the table completely to start fresh
DROP TABLE IF EXISTS physical_card_requests CASCADE;

-- Recreate the table
CREATE TABLE physical_card_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User information snapshot at time of request
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Card information
    card_identifier VARCHAR(50) NOT NULL,
    membership_tier VARCHAR(20) NOT NULL,
    
    -- Delivery information
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_country VARCHAR(100) DEFAULT 'Mali',
    
    -- Request status
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
        'pending_payment',
        'payment_confirmed', 
        'card_ordered',
        'card_shipped',
        'delivered',
        'cancelled'
    )),
    
    -- Payment information
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    tracking_number VARCHAR(100),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_physical_card_requests_user_id ON physical_card_requests(user_id);
CREATE INDEX idx_physical_card_requests_status ON physical_card_requests(status);
CREATE INDEX idx_physical_card_requests_created_at ON physical_card_requests(created_at);

-- Enable RLS
ALTER TABLE physical_card_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only see their own requests
CREATE POLICY "Users can view own physical card requests" ON physical_card_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create own physical card requests" ON physical_card_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update own physical card requests" ON physical_card_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow all operations for authenticated users (admin access)
CREATE POLICY "Authenticated users can manage all physical card requests" ON physical_card_requests
    FOR ALL USING (auth.role() = 'authenticated');

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

-- Add some sample data for testing
INSERT INTO physical_card_requests (
    user_id, full_name, phone, email, card_identifier, membership_tier,
    delivery_address, delivery_city, delivery_country, status, payment_amount, payment_status
) 
SELECT 
    id,
    'Utilisateur Test',
    '+22370123456',
    email,
    'ML25-' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0') || '-01',
    'premium',
    '123 Rue de Test',
    'Bamako',
    'Mali',
    'pending_payment',
    0,
    'pending'
FROM auth.users 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Verify the table was created successfully
SELECT 'Table physical_card_requests created successfully!' as result;
