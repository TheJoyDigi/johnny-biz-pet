-- Migration to fix booking cost calculation: Prioritize snapshotted rates

-- 1. Update calculate_booking_cost to prioritize snapshot
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
    -- Uses price_cents_at_booking if available, else falls back to current sitter_addons price
    SELECT COALESCE(SUM(
        CASE 
            WHEN ba.price_cents_at_booking IS NOT NULL AND ba.price_cents_at_booking > 0 THEN ba.price_cents_at_booking
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

-- 2. Update accept_booking_request to NOT overwrite snapshots
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

    -- Update addon prices ONLY if missing (preserve snapshot)
    FOR addon_record IN
        SELECT ba.sitter_addon_id, sa.price_cents
        FROM booking_addons ba
        JOIN sitter_addons sa ON ba.sitter_addon_id = sa.id
        WHERE ba.booking_request_id = booking_id
          AND (ba.price_cents_at_booking IS NULL OR ba.price_cents_at_booking = 0)
    LOOP
        UPDATE booking_addons
        SET price_cents_at_booking = addon_record.price_cents
        WHERE booking_request_id = booking_id AND sitter_addon_id = addon_record.sitter_addon_id;
    END LOOP;

    -- Use the common calculation function to get all values
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
