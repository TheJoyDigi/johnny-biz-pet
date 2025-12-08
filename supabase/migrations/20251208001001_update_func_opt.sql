-- Drop the function first because we are renaming a parameter (p_service_type_id -> p_service_primary_id)
DROP FUNCTION IF EXISTS calculate_booking_cost(uuid, uuid, uuid);
-- Also drop the legacy 2-arg version if it exists to avoid ambiguity
DROP FUNCTION IF EXISTS calculate_booking_cost(uuid, uuid);

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
    calculated_total_cost_cents integer;
    
    -- Fee variables
    platform_fee_percentage integer := 20; 
    platform_fee_cents integer;
    sitter_payout_cents integer;
    
    target_service_primary_id uuid;
BEGIN
    -- Determine Service Item ID (Primary Service)
    IF p_service_primary_id IS NOT NULL THEN
        target_service_primary_id := p_service_primary_id;
    ELSE
        SELECT sitter_service_id INTO target_service_primary_id FROM booking_requests WHERE id = booking_id;
    END IF;

    -- PRIORITIZE SNAPSHOT: Try to get existing base rate from booking
    SELECT base_rate_at_booking_cents INTO sitter_base_rate_cents
    FROM booking_requests WHERE id = booking_id;

    -- If snapshot is missing or 0, fetch live rate using ID
    IF (sitter_base_rate_cents IS NULL OR sitter_base_rate_cents = 0) THEN
        IF target_service_primary_id IS NOT NULL THEN
            SELECT price_cents INTO sitter_base_rate_cents 
            FROM sitter_primary_services 
            WHERE id = target_service_primary_id;
        ELSE
             -- Fallback: Legacy logic
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

    -- Get booking duration
    SELECT end_date - start_date INTO num_days FROM booking_requests WHERE id = booking_id;

    -- Calculate base cost
    base_cost_cents := sitter_base_rate_cents * num_days;

    -- Calculate addons cost (using quantity)
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
