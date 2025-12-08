-- Migration to add quantity to booking_addons and remove county from booking_requests

-- 1. Add quantity column to booking_addons
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_addons' AND column_name = 'quantity') THEN
        ALTER TABLE booking_addons ADD COLUMN quantity INTEGER DEFAULT 1 NOT NULL;
    END IF;
END $$;

-- 2. Drop county column from booking_requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'county') THEN
        ALTER TABLE booking_requests DROP COLUMN county;
    END IF;
END $$;

-- 3. Update calculate_booking_cost to respect quantity
CREATE OR REPLACE FUNCTION calculate_booking_cost(
    booking_id uuid,
    sitter_profile_id uuid,
    p_service_type_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    sitter_base_rate_cents integer;
    num_days integer;
    addons_cost_cents integer;
    discount_percentage integer;
    base_cost_cents integer;
    discount_amount_cents integer;
    calculated_total_cost_cents integer;
    
    -- Fee variables
    platform_fee_percentage integer := 20; 
    platform_fee_cents integer;
    sitter_payout_cents integer;
    
    target_service_type_id uuid;
BEGIN
    -- Determine Service Type
    IF p_service_type_id IS NOT NULL THEN
        target_service_type_id := p_service_type_id;
    ELSE
        SELECT service_type_id INTO target_service_type_id FROM booking_requests WHERE id = booking_id;
    END IF;

    -- Fallback to 'dog-boarding' if still null
    IF target_service_type_id IS NULL THEN
        SELECT id INTO target_service_type_id FROM service_types WHERE slug = 'dog-boarding';
    END IF;

    -- PRIORITIZE SNAPSHOT: Try to get existing base rate from booking
    SELECT base_rate_at_booking_cents INTO sitter_base_rate_cents
    FROM booking_requests WHERE id = booking_id;

    -- If snapshot is missing or 0 (legacy), fetch live rate
    IF sitter_base_rate_cents IS NULL OR sitter_base_rate_cents = 0 THEN
        SELECT price_cents INTO sitter_base_rate_cents 
        FROM sitter_primary_services 
        WHERE sitter_id = sitter_profile_id AND service_type_id = target_service_type_id;

        -- Handle case where sitter doesn't have a rate for this service
        IF sitter_base_rate_cents IS NULL THEN
            RAISE EXCEPTION 'Sitter does not have a rate for this service type';
        END IF;
    END IF;

    -- Get booking duration
    SELECT end_date - start_date INTO num_days FROM booking_requests WHERE id = booking_id;

    -- Calculate base cost
    base_cost_cents := sitter_base_rate_cents * num_days;

    -- Calculate addons cost
    -- NOW MULTIPLY BY QUANTITY
    SELECT COALESCE(SUM(
        (CASE 
            WHEN ba.price_cents_at_booking IS NOT NULL AND ba.price_cents_at_booking > 0 THEN ba.price_cents_at_booking
            ELSE sa.price_cents
        END) * ba.quantity
    ), 0) INTO addons_cost_cents
    FROM booking_addons ba
    JOIN sitter_addons sa ON ba.sitter_addon_id = sa.id
    WHERE ba.booking_request_id = booking_id;

    -- Calculate discount
    SELECT COALESCE(MAX(percentage), 0) INTO discount_percentage
    FROM sitter_discounts
    WHERE sitter_id = sitter_profile_id AND min_days <= num_days;

    discount_amount_cents := (base_cost_cents * discount_percentage) / 100;

    -- Calculate final total cost
    calculated_total_cost_cents := base_cost_cents - discount_amount_cents + addons_cost_cents;

    -- Fee Calculation
    platform_fee_cents := ((base_cost_cents - discount_amount_cents) * platform_fee_percentage) / 100;
    
    -- Sitter Payout
    sitter_payout_cents := calculated_total_cost_cents - platform_fee_cents;

    RETURN json_build_object(
        'total_cost_cents', calculated_total_cost_cents,
        'base_rate_at_booking_cents', sitter_base_rate_cents,
        'addons_total_cost_cents', addons_cost_cents,
        'discount_applied_cents', discount_amount_cents,
        'platform_fee_cents', platform_fee_cents,
        'sitter_payout_cents', sitter_payout_cents
    );
END;
$$ LANGUAGE plpgsql;
