CREATE OR REPLACE FUNCTION accept_booking_request(booking_id uuid, sitter_user_id uuid)
RETURNS void AS $$
DECLARE
    v_sitter_profile_id uuid;
    v_sitter_base_rate_cents integer;
    v_booking_status text;
    v_num_days integer;
    
    v_calculated_total_cost_cents integer;
    v_addons_cost_cents integer;
    v_discount_amount_cents integer;
    
    v_platform_fee_cents integer;
    v_sitter_payout_cents integer;
    v_owner_fee_cents integer;
    v_cost_breakdown json;
    
    v_target_sitter_service_id uuid;
    addon_record record;
BEGIN
    -- Sitter Profile
    SELECT id INTO v_sitter_profile_id FROM sitters WHERE user_id = sitter_user_id;

    -- Check Pending & Get Details
    SELECT status, end_date - start_date, sitter_service_id 
    INTO v_booking_status, v_num_days, v_target_sitter_service_id 
    FROM booking_requests WHERE id = booking_id;

    IF v_booking_status != 'PENDING_SITTER_ACCEPTANCE' THEN
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
    v_cost_breakdown := calculate_booking_cost(booking_id, v_sitter_profile_id, v_target_sitter_service_id);

    -- Extract
    v_calculated_total_cost_cents := (v_cost_breakdown->>'total_cost_cents')::integer;
    v_sitter_base_rate_cents := (v_cost_breakdown->>'base_rate_at_booking_cents')::integer;
    v_addons_cost_cents := (v_cost_breakdown->>'addons_total_cost_cents')::integer;
    v_discount_amount_cents := (v_cost_breakdown->>'discount_applied_cents')::integer;
    v_platform_fee_cents := (v_cost_breakdown->>'platform_fee_cents')::integer;
    v_sitter_payout_cents := (v_cost_breakdown->>'sitter_payout_cents')::integer;
    v_owner_fee_cents := (v_cost_breakdown->>'owner_service_fee_cents')::integer;

    -- Update Booking
    UPDATE booking_requests
    SET
        status = 'ACCEPTED',
        assigned_sitter_id = v_sitter_profile_id,
        total_cost_cents = v_calculated_total_cost_cents,
        base_rate_at_booking_cents = v_sitter_base_rate_cents,
        addons_total_cost_cents = v_addons_cost_cents,
        discount_applied_cents = v_discount_amount_cents,
        platform_fee_cents = v_platform_fee_cents,
        sitter_payout_cents = v_sitter_payout_cents,
        owner_service_fee_cents = v_owner_fee_cents
    WHERE id = booking_id;

    -- Recipients
    UPDATE booking_sitter_recipients
    SET status = 'ACCEPTED'
    WHERE booking_request_id = booking_id AND sitter_id = v_sitter_profile_id;

    UPDATE booking_sitter_recipients
    SET status = 'UNAVAILABLE'
    WHERE booking_request_id = booking_id AND sitter_id != v_sitter_profile_id;
END;
$$ LANGUAGE plpgsql;
