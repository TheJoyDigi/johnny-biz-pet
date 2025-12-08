-- Drop the legacy 2-arg function to resolve ambiguity with the 3-arg function (which has a default parameter)
DROP FUNCTION IF EXISTS calculate_booking_cost(uuid, uuid);
