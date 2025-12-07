-- Migration to update booking logic with service types and platform fees

-- 1. Add service_type_id to booking_requests if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'service_type_id') THEN
        ALTER TABLE booking_requests ADD COLUMN service_type_id UUID REFERENCES service_types(id);
    END IF;
END $$;

-- 2. Add financial columns for platform fee and sitter payout
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'platform_fee_cents') THEN
        ALTER TABLE booking_requests ADD COLUMN platform_fee_cents INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_requests' AND column_name = 'sitter_payout_cents') THEN
        ALTER TABLE booking_requests ADD COLUMN sitter_payout_cents INT DEFAULT 0;
    END IF;
END $$;

-- 3. Update calculate_booking_cost to use service_primary_services and calculate fees
CREATE OR REPLACE FUNCTION calculate_booking_cost(
    booking_id uuid,
    sitter_profile_id uuid,
    p_service_type_id uuid DEFAULT NULL -- Optional, checks booking if null
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
    platform_fee_percentage integer := 20; -- Default 20% platform fee on base service
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

    -- Fallback to 'dog-boarding' if still null (for legacy compatibility)
    IF target_service_type_id IS NULL THEN
        SELECT id INTO target_service_type_id FROM service_types WHERE slug = 'dog-boarding';
    END IF;

    -- Get sitter's base rate for the specific service
    SELECT price_cents INTO sitter_base_rate_cents 
    FROM sitter_primary_services 
    WHERE sitter_id = sitter_profile_id AND service_type_id = target_service_type_id;

    -- Handle case where sitter doesn't have a rate for this service
    IF sitter_base_rate_cents IS NULL THEN
        RAISE EXCEPTION 'Sitter does not have a rate for this service type';
    END IF;

    -- Get booking duration
    SELECT end_date - start_date INTO num_days FROM booking_requests WHERE id = booking_id;

    -- Calculate base cost
    base_cost_cents := sitter_base_rate_cents * num_days;

    -- Calculate addons cost (using price at booking if mapped, or current price?)
    -- Logic: If it's a new calculation (before booking ref exists fully), we might look at cart. 
    -- But this function takes booking_id, so it assumes rows exist.
    -- We'll use booking_addons.price_cents_at_booking if set, else sitter_addons.price_cents
    SELECT COALESCE(SUM(
        CASE 
            WHEN ba.price_cents_at_booking IS NOT NULL THEN ba.price_cents_at_booking
            ELSE sa.price_cents
        END
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

    -- Fee Calculation: Platform fee only applies to the Net Base Cost (Base - Discount)
    -- Addons are 100% to sitter.
    platform_fee_cents := ((base_cost_cents - discount_amount_cents) * platform_fee_percentage) / 100;
    
    -- Sitter Payout = Total - Platform Fee
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

-- 4. Update accept_booking_request to store the new fee structure
CREATE OR REPLACE FUNCTION accept_booking_request(booking_id uuid, sitter_user_id uuid)
RETURNS void AS $$
DECLARE
    sitter_profile_id uuid;
    sitter_base_rate_cents integer;
    booking_status text;
    num_days integer;
    addons_cost_cents integer;
    discount_percentage integer;
    base_cost_cents integer;
    discount_amount_cents integer;
    calculated_total_cost_cents integer;
    
    platform_fee_cents integer;
    sitter_payout_cents integer;
    cost_breakdown json;
    
    target_service_type_id uuid;
    addon_record record;
BEGIN
    -- Get the sitter's profile ID
    SELECT id INTO sitter_profile_id FROM sitters WHERE user_id = sitter_user_id;

    -- Check if the booking is still pending
    SELECT status, end_date - start_date, service_type_id 
    INTO booking_status, num_days, target_service_type_id 
    FROM booking_requests WHERE id = booking_id;

    IF booking_status != 'PENDING_SITTER_ACCEPTANCE' THEN
        RAISE EXCEPTION 'Booking has already been taken';
    END IF;

    -- Update addon prices before calculating total
    FOR addon_record IN
        SELECT ba.sitter_addon_id, sa.price_cents
        FROM booking_addons ba
        JOIN sitter_addons sa ON ba.sitter_addon_id = sa.id
        WHERE ba.booking_request_id = booking_id
    LOOP
        UPDATE booking_addons
        SET price_cents_at_booking = addon_record.price_cents
        WHERE booking_request_id = booking_id AND sitter_addon_id = addon_record.sitter_addon_id;
    END LOOP;

    -- Use the common calculation function to get all values
    -- Pass the optional service type if found in booking
    cost_breakdown := calculate_booking_cost(booking_id, sitter_profile_id, target_service_type_id);

    -- Extract values
    calculated_total_cost_cents := (cost_breakdown->>'total_cost_cents')::integer;
    sitter_base_rate_cents := (cost_breakdown->>'base_rate_at_booking_cents')::integer;
    addons_cost_cents := (cost_breakdown->>'addons_total_cost_cents')::integer;
    discount_amount_cents := (cost_breakdown->>'discount_applied_cents')::integer;
    platform_fee_cents := (cost_breakdown->>'platform_fee_cents')::integer;
    sitter_payout_cents := (cost_breakdown->>'sitter_payout_cents')::integer;

    -- Update the booking request
    UPDATE booking_requests
    SET
        status = 'ACCEPTED',
        assigned_sitter_id = sitter_profile_id,
        total_cost_cents = calculated_total_cost_cents,
        base_rate_at_booking_cents = sitter_base_rate_cents,
        addons_total_cost_cents = addons_cost_cents,
        discount_applied_cents = discount_amount_cents,
        platform_fee_cents = platform_fee_cents,
        sitter_payout_cents = sitter_payout_cents
    WHERE id = booking_id;

    -- Update the booking_sitter_recipients table
    UPDATE booking_sitter_recipients
    SET status = 'ACCEPTED'
    WHERE booking_request_id = booking_id AND sitter_id = sitter_profile_id;

    UPDATE booking_sitter_recipients
    SET status = 'UNAVAILABLE'
    WHERE booking_request_id = booking_id AND sitter_id != sitter_profile_id;
END;
$$ LANGUAGE plpgsql;
