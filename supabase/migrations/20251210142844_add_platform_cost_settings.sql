CREATE TABLE IF NOT EXISTS platform_cost_settings (
    id integer PRIMARY KEY CHECK (id = 1),
    pet_owner_service_fee_percentage numeric(5, 2) NOT NULL DEFAULT 7.00,
    sitter_primary_service_fee_percentage numeric(5, 2) NOT NULL DEFAULT 15.00,
    sitter_addon_fee_percentage numeric(5, 2) NOT NULL DEFAULT 0.00,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_cost_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (needed for frontend price estimation)
CREATE POLICY "Allow public read access" ON platform_cost_settings 
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON platform_cost_settings 
    FOR ALL USING (auth.role() = 'service_role'); -- OR true for simplicity if auth.role() isn't standard in this setup, but service_role is standard Supabase.

-- Seed initial values
INSERT INTO platform_cost_settings (
    id, 
    pet_owner_service_fee_percentage, 
    sitter_primary_service_fee_percentage, 
    sitter_addon_fee_percentage
)
VALUES (1, 7.00, 15.00, 0.00)
ON CONFLICT (id) DO UPDATE SET
    pet_owner_service_fee_percentage = EXCLUDED.pet_owner_service_fee_percentage,
    sitter_primary_service_fee_percentage = EXCLUDED.sitter_primary_service_fee_percentage,
    sitter_addon_fee_percentage = EXCLUDED.sitter_addon_fee_percentage;
