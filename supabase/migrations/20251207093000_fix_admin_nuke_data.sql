-- Fix admin_nuke_data to remove non-existent tables
-- Removed: public.reviews (deprecated/non-existent)

CREATE OR REPLACE FUNCTION admin_nuke_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Truncate all public tables that have data
  -- We use CASCADE to handle foreign keys
  -- Removed public.reviews
  TRUNCATE TABLE 
    public.sitters, 
    public.customers, 
    public.booking_requests, 
    public.booking_sitter_recipients, 
    public.booking_pets, 
    public.booking_addons, 
    public.sitter_reviews,
    public.sitter_addons,
    public.sitter_discounts,
    public.sitter_primary_services,
    public.pets,
    public.signed_waivers,
    public.users
  RESTART IDENTITY CASCADE;

  -- 2. Delete Auth Users
  DELETE FROM auth.users;
  
END;
$$;

-- Grant execution only to service_role
REVOKE EXECUTE ON FUNCTION admin_nuke_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_nuke_data() TO service_role;
