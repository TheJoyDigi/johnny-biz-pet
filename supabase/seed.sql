-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Set the search path to include the extensions schema
SET search_path = public, extensions;

-- 2. Create a function to create users
CREATE OR REPLACE FUNCTION create_user(email text, password text, role text)
RETURNS uuid AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Generate a random UUID for the user
  user_id := gen_random_uuid();

  -- Encrypt the password using bcrypt
  encrypted_pw := crypt(password, extensions.gen_salt('bf'));

  -- Insert into auth.users
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

  -- Insert into auth.identities
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), user_id, user_id::text, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', now(), now(), now());

  -- Insert into public.users
  INSERT INTO public.users (id, email, role)
  VALUES (user_id, email, role);

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Clear existing data
TRUNCATE TABLE public.users, public.sitters, public.customers, public.pets, public.signed_waivers, public.sitter_addons, public.sitter_discounts, public.booking_requests, public.booking_sitter_recipients, public.booking_pets, public.booking_addons, public.service_types, public.sitter_primary_services RESTART IDENTITY CASCADE;

-- 4. Seed data
DO $$
DECLARE
  admin_id uuid;
  sitter1_id uuid;
  sitter2_id uuid;
  sitter_profile1_id uuid;
  sitter_profile2_id uuid;
  customer1_id uuid;
  customer2_id uuid;
  customer3_id uuid;
  customer4_id uuid;
  customer5_id uuid;
  customer6_id uuid;
  customer7_id uuid;
  customer8_id uuid;
  customer9_id uuid;
  customer10_id uuid;
  pet1_id uuid;
  pet2_id uuid;
  addon1_id uuid;
  addon2_id uuid;
  booking_request1_id uuid;
  booking_request2_id uuid;
  booking_request3_id uuid;
  booking_request4_id uuid;
  booking_request5_id uuid;
  booking_request6_id uuid;
  booking_request7_id uuid;
  booking_request8_id uuid;
  booking_request9_id uuid;
  booking_request10_id uuid;
  boarding_id uuid;
  daycare_id uuid;
BEGIN
  -- Create Service Types
  INSERT INTO service_types (name, slug, description)
  VALUES ('Dog Boarding', 'dog-boarding', 'Overnight stays') RETURNING id INTO boarding_id;
  INSERT INTO service_types (name, slug, description)
  VALUES ('Doggy Daycare', 'doggy-daycare', 'Daytime care') RETURNING id INTO daycare_id;

  -- Create users and get their IDs
  admin_id := create_user('admin@mailinator.com', 'password', 'ADMIN');
  sitter1_id := create_user('sitter1@mailinator.com', 'password', 'SITTER');
  sitter2_id := create_user('sitter2@mailinator.com', 'password', 'SITTER');

  -- Update users with first and last names
  UPDATE public.users SET first_name = 'Admin', last_name = 'User' WHERE id = admin_id;
  UPDATE public.users SET first_name = 'Sitter', last_name = 'One' WHERE id = sitter1_id;
  UPDATE public.users SET first_name = 'Sitter', last_name = 'Two' WHERE id = sitter2_id;

  -- Create sitters
  INSERT INTO sitters (user_id, address, county, signature_url, is_active)
  VALUES (sitter1_id, '123 Sitter Lane', 'County One', 'https://www.mailinator.com/signature1.png', true) RETURNING id INTO sitter_profile1_id;
  INSERT INTO sitters (user_id, address, county, signature_url, is_active)
  VALUES (sitter2_id, '456 Sitter Street', 'County Two', 'https://www.mailinator.com/signature2.png', true) RETURNING id INTO sitter_profile2_id;

  -- Create Sitter Primary Services
  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile1_id, boarding_id, 5000);
  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile2_id, boarding_id, 6000);

  -- Create Sitter Add-ons
  INSERT INTO sitter_addons (sitter_id, name, price_cents, description)
  VALUES
  (sitter_profile1_id, 'Daily Walk', 1000, 'A 30-minute walk every day.') RETURNING id INTO addon1_id;
  INSERT INTO sitter_addons (sitter_id, name, price_cents, description)
  VALUES
  (sitter_profile1_id, 'Grooming', 2500, 'A full grooming session.') RETURNING id INTO addon2_id;
  INSERT INTO sitter_addons (sitter_id, name, price_cents, description)
  VALUES
  (sitter_profile2_id, 'Medication Administration', 500, 'Administer medication as required.');
  INSERT INTO sitter_addons (sitter_id, name, price_cents, description)
  VALUES
  (sitter_profile2_id, 'Special Diet Fee', 1000, 'Fee for preparing special meals.');

    -- Create Sitter Discounts

    INSERT INTO sitter_discounts (sitter_id, min_days, percentage)

    VALUES

    (sitter_profile1_id, 8, 10), -- 10% off for stays longer than 7 days

    (sitter_profile1_id, 15, 20), -- 20% off for stays longer than 14 days

    (sitter_profile2_id, 6, 5), -- 5% off for stays longer than 5 days

    (sitter_profile2_id, 11, 15); -- 15% off for stays longer than 10 days

  

    -- Create Customers

    INSERT INTO customers (name, email) VALUES ('Customer One', 'customer1@mailinator.com') RETURNING id INTO customer1_id;

    INSERT INTO customers (name, email) VALUES ('Customer Two', 'customer2@mailinator.com') RETURNING id INTO customer2_id;

    INSERT INTO customers (name, email) VALUES ('Customer Three', 'customer3@mailinator.com') RETURNING id INTO customer3_id;

    INSERT INTO customers (name, email) VALUES ('Customer Four', 'customer4@mailinator.com') RETURNING id INTO customer4_id;

    INSERT INTO customers (name, email) VALUES ('Customer Five', 'customer5@mailinator.com') RETURNING id INTO customer5_id;

  

    -- Create Pets

    INSERT INTO pets (customer_id, name, breed, age, notes)

    VALUES

    (customer1_id, 'Buddy', 'Golden Retriever', 5, 'Loves to play fetch.') RETURNING id INTO pet1_id;

    INSERT INTO pets (customer_id, name, breed, age, notes)

    VALUES

    (customer2_id, 'Lucy', 'Beagle', 3, 'Eats everything.') RETURNING id INTO pet2_id;

  

    -- Create Booking Requests for testing various scenarios

    -- Booking 1: Sitter 1, 5 days, 1 addon, no discount

    INSERT INTO booking_requests (customer_id, start_date, end_date, county, status)

    VALUES (customer1_id, '2025-11-01', '2025-11-06', 'County One', 'PENDING_SITTER_ACCEPTANCE') RETURNING id INTO booking_request1_id;

    INSERT INTO booking_pets (booking_request_id, pet_id) VALUES (booking_request1_id, pet1_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id) VALUES (booking_request1_id, addon1_id);

  

    -- Booking 2: Sitter 1, 8 days, 2 addons, 10% discount

    INSERT INTO booking_requests (customer_id, start_date, end_date, county, status)

    VALUES (customer2_id, '2025-11-10', '2025-11-18', 'County One', 'PENDING_SITTER_ACCEPTANCE') RETURNING id INTO booking_request2_id;

    INSERT INTO booking_pets (booking_request_id, pet_id) VALUES (booking_request2_id, pet2_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id) VALUES (booking_request2_id, addon1_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id) VALUES (booking_request2_id, addon2_id);

  

    -- Booking 3: Sitter 1, 16 days, 1 addon, 20% discount

    INSERT INTO booking_requests (customer_id, start_date, end_date, county, status)

    VALUES (customer3_id, '2025-12-01', '2025-12-17', 'County One', 'PENDING_SITTER_ACCEPTANCE') RETURNING id INTO booking_request3_id;

    INSERT INTO booking_pets (booking_request_id, pet_id) VALUES (booking_request3_id, pet1_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id) VALUES (booking_request3_id, addon2_id);

  

    -- Booking 4: Sitter 2, 4 days, 1 addon, no discount

    INSERT INTO booking_requests (customer_id, start_date, end_date, county, status)

    VALUES (customer4_id, '2025-11-05', '2025-11-09', 'County Two', 'PENDING_SITTER_ACCEPTANCE') RETURNING id INTO booking_request4_id;

    INSERT INTO booking_pets (booking_request_id, pet_id) VALUES (booking_request4_id, pet2_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id)

      SELECT booking_request4_id, id FROM sitter_addons WHERE sitter_id = sitter_profile2_id AND name = 'Medication Administration';

  

    -- Booking 5: Sitter 2, 7 days, 1 addon, 5% discount

    INSERT INTO booking_requests (customer_id, start_date, end_date, county, status)

    VALUES (customer5_id, '2025-11-20', '2025-11-27', 'County Two', 'PENDING_SITTER_ACCEPTANCE') RETURNING id INTO booking_request5_id;

    INSERT INTO booking_pets (booking_request_id, pet_id) VALUES (booking_request5_id, pet1_id);

    INSERT INTO booking_addons (booking_request_id, sitter_addon_id)

      SELECT booking_request5_id, id FROM sitter_addons WHERE sitter_id = sitter_profile2_id AND name = 'Special Diet Fee';

  

  

  END $$;

  

  -- 5. Seed booking_sitter_recipients

  DO $$

  DECLARE

    sitter1_profile_id uuid;

    sitter2_profile_id uuid;

    booking_id uuid;

  BEGIN

    -- Get sitter profile ids

    SELECT id INTO sitter1_profile_id FROM sitters WHERE user_id = (SELECT id FROM users WHERE email = 'sitter1@mailinator.com');

    SELECT id INTO sitter2_profile_id FROM sitters WHERE user_id = (SELECT id FROM users WHERE email = 'sitter2@mailinator.com');

  

    -- Assign sitters to booking requests

    -- Sitter 1 gets bookings 1, 2, 3

    FOR booking_id IN SELECT id FROM booking_requests WHERE county = 'County One' LOOP

      INSERT INTO booking_sitter_recipients (booking_request_id, sitter_id)

      VALUES (booking_id, sitter1_profile_id);

    END LOOP;

  

    -- Sitter 2 gets bookings 4, 5

    FOR booking_id IN SELECT id FROM booking_requests WHERE county = 'County Two' LOOP

      INSERT INTO booking_sitter_recipients (booking_request_id, sitter_id)

      VALUES (booking_id, sitter2_profile_id);

    END LOOP;

  

    -- Also assign sitter 1 to booking 4 for testing multiple sitters

    INSERT INTO booking_sitter_recipients (booking_request_id, sitter_id)

    SELECT id, sitter1_profile_id FROM booking_requests WHERE county = 'County Two' LIMIT 1;

  

  END $$;

  