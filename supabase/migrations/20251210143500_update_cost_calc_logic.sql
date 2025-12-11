-- 1. Add owner_service_fee_cents to booking_requests
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS owner_service_fee_cents INTEGER DEFAULT 0;

-- 2. Update calculate_booking_cost to use dynamic platform cost settings
CREATE OR REPLACE FUNCTION calculate_booking_cost(
    booking_id uuid,
    sitter_profile_id uuid,
    p_service_primary_id uuid DEFAULT NULL 
)
RETURNS json AS $$
DECLARE
    sitter_base_rate_cents integer;
    num_days integer;
    addons_cost_cents integer;
    discount_percentage integer;
    
    base_cost_cents integer;
    discount_amount_cents integer;
    
    -- Structure variables
    subtotal_cents integer;
    owner_fee_cents integer;
    calculated_total_cost_cents integer;
    
    -- Fee variables
    config_owner_fee_pct numeric;
    config_sitter_primary_fee_pct numeric;
    config_sitter_addon_fee_pct numeric;
    
    platform_fee_from_sitter_cents integer;
    platform_fee_cents integer;
    sitter_payout_cents integer;
    
    target_service_primary_id uuid;
BEGIN
    -- Config
    SELECT 
        pet_owner_service_fee_percentage,
        sitter_primary_service_fee_percentage,
        sitter_addon_fee_percentage
    INTO
        config_owner_fee_pct,
        config_sitter_primary_fee_pct,
        config_sitter_addon_fee_pct
    FROM platform_cost_settings
    WHERE id = 1;
    
    -- Defaults if table is empty
    IF config_owner_fee_pct IS NULL THEN
        config_owner_fee_pct := 7.00;
        config_sitter_primary_fee_pct := 15.00;
        config_sitter_addon_fee_pct := 0.00;
    END IF;

    -- Determine Service ID
    IF p_service_primary_id IS NOT NULL THEN
        target_service_primary_id := p_service_primary_id;
    ELSE
        SELECT sitter_service_id INTO target_service_primary_id FROM booking_requests WHERE id = booking_id;
    END IF;

    -- SNAPSHOT: Try to get existing base rate from booking
    SELECT base_rate_at_booking_cents INTO sitter_base_rate_cents
    FROM booking_requests WHERE id = booking_id;

    -- If missing, fetch live
    IF (sitter_base_rate_cents IS NULL OR sitter_base_rate_cents = 0) THEN
        IF target_service_primary_id IS NOT NULL THEN
            SELECT price_cents INTO sitter_base_rate_cents 
            FROM sitter_primary_services 
            WHERE id = target_service_primary_id;
        END IF; 
        
        -- Fallback if still null? Use legacy fallback logic if needed, but primary_id should be there.
        IF sitter_base_rate_cents IS NULL THEN
             -- Try legacy fallback: via service_type_id
             SELECT sps.price_cents INTO sitter_base_rate_cents
             FROM sitter_primary_services sps
             JOIN booking_requests br ON br.service_type_id = sps.service_type_id
             WHERE sps.sitter_id = sitter_profile_id AND br.id = booking_id
             LIMIT 1;
        END IF;

        IF sitter_base_rate_cents IS NULL THEN
            RAISE EXCEPTION 'Sitter does not have a rate for this service';
        END IF;
    END IF;

    -- Booking Duration
    SELECT end_date - start_date INTO num_days FROM booking_requests WHERE id = booking_id;

    -- Base Cost
    base_cost_cents := sitter_base_rate_cents * num_days;

    -- Addons Cost (Quantity aware)
    SELECT COALESCE(SUM(
        (CASE 
            WHEN ba.price_cents_at_booking IS NOT NULL AND ba.price_cents_at_booking > 0 THEN ba.price_cents_at_booking
            ELSE sa.price_cents
        END) * ba.quantity
    ), 0) INTO addons_cost_cents
    FROM booking_addons ba
    JOIN sitter_addons sa ON ba.sitter_addon_id = sa.id
    WHERE ba.booking_request_id = booking_id;

    -- Discount
    SELECT COALESCE(MAX(percentage), 0) INTO discount_percentage
    FROM sitter_discounts
    WHERE sitter_id = sitter_profile_id AND min_days <= num_days;

    discount_amount_cents := (base_cost_cents * discount_percentage) / 100;

    -- Calculations
    subtotal_cents := base_cost_cents - discount_amount_cents + addons_cost_cents;
    
    -- Owner Fee (Add on top of subtotal)
    owner_fee_cents := ROUND(subtotal_cents * (config_owner_fee_pct / 100.0));
    
    -- Total Cost (User Pays)
    calculated_total_cost_cents := subtotal_cents + owner_fee_cents;

    -- Platform Fee from Sitter (Commission)
    -- Commission on Net Primary + Commission on Net Addons
    platform_fee_from_sitter_cents := ROUND((base_cost_cents - discount_amount_cents) * (config_sitter_primary_fee_pct / 100.0))
                                    + ROUND(addons_cost_cents * (config_sitter_addon_fee_pct / 100.0));

    -- Payout
    sitter_payout_cents := subtotal_cents - platform_fee_from_sitter_cents;
    
    -- Total Platform Revenue (Owner Fee + Sitter Commission)
    platform_fee_cents := owner_fee_cents + platform_fee_from_sitter_cents;

    RETURN json_build_object(
        'total_cost_cents', calculated_total_cost_cents,
        'base_rate_at_booking_cents', sitter_base_rate_cents,
        'addons_total_cost_cents', addons_cost_cents,
        'discount_applied_cents', discount_amount_cents,
        'owner_service_fee_cents', owner_fee_cents,
        'platform_fee_cents', platform_fee_cents,
        'sitter_payout_cents', sitter_payout_cents
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Update accept_booking_request to store owner_service_fee and use correct helper
CREATE OR REPLACE FUNCTION accept_booking_request(booking_id uuid, sitter_user_id uuid)
RETURNS void AS $$
DECLARE
    sitter_profile_id uuid;
    sitter_base_rate_cents integer;
    booking_status text;
    num_days integer;
    addons_cost_cents integer;
    discount_percentage integer;
    calculated_total_cost_cents integer;
    discount_amount_cents integer;
    
    platform_fee_cents integer;
    sitter_payout_cents integer;
    owner_fee_cents integer;
    cost_breakdown json;
    
    target_sitter_service_id uuid;
    addon_record record;
BEGIN
    -- Sitter Profile
    SELECT id INTO sitter_profile_id FROM sitters WHERE user_id = sitter_user_id;

    -- Check Pending & Get Details
    SELECT status, end_date - start_date, sitter_service_id 
    INTO booking_status, num_days, target_sitter_service_id 
    FROM booking_requests WHERE id = booking_id;

    IF booking_status != 'PENDING_SITTER_ACCEPTANCE' THEN
        RAISE EXCEPTION 'Booking has already been taken';
    END IF;

    -- Snapshot Addons
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

    -- Calculate
    cost_breakdown := calculate_booking_cost(booking_id, sitter_profile_id, target_sitter_service_id);

    -- Extract
    calculated_total_cost_cents := (cost_breakdown->>'total_cost_cents')::integer;
    sitter_base_rate_cents := (cost_breakdown->>'base_rate_at_booking_cents')::integer;
    addons_cost_cents := (cost_breakdown->>'addons_total_cost_cents')::integer;
    discount_amount_cents := (cost_breakdown->>'discount_applied_cents')::integer;
    platform_fee_cents := (cost_breakdown->>'platform_fee_cents')::integer;
    sitter_payout_cents := (cost_breakdown->>'sitter_payout_cents')::integer;
    owner_fee_cents := (cost_breakdown->>'owner_service_fee_cents')::integer;

    -- Update Booking
    UPDATE booking_requests
    SET
        status = 'ACCEPTED',
        assigned_sitter_id = sitter_profile_id,
        total_cost_cents = calculated_total_cost_cents,
        base_rate_at_booking_cents = sitter_base_rate_cents,
        addons_total_cost_cents = addons_cost_cents,
        discount_applied_cents = discount_amount_cents,
        platform_fee_cents = platform_fee_cents,
        sitter_payout_cents = sitter_payout_cents,
        owner_service_fee_cents = owner_fee_cents
    WHERE id = booking_id;

    -- Recipients
    UPDATE booking_sitter_recipients
    SET status = 'ACCEPTED'
    WHERE booking_request_id = booking_id AND sitter_id = sitter_profile_id;

    UPDATE booking_sitter_recipients
    SET status = 'UNAVAILABLE'
    WHERE booking_request_id = booking_id AND sitter_id != sitter_profile_id;
END;
$$ LANGUAGE plpgsql;
