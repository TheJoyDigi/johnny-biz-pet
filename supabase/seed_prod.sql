-- Production Seed Script
-- Generated from data/sitters.json

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Cleanup
TRUNCATE TABLE public.users, public.sitters, public.customers, public.pets, public.signed_waivers, public.sitter_addons, public.sitter_discounts, public.booking_requests, public.booking_sitter_recipients, public.booking_pets, public.booking_addons, public.service_types, public.sitter_primary_services RESTART IDENTITY CASCADE;

-- 3. Service Types
DO $$
DECLARE
  boarding_id uuid;
  daycare_id uuid;
  admin_id uuid;
  sitter_user_id uuid;
  sitter_profile_id uuid;
BEGIN

  -- Create Service Types
  INSERT INTO service_types (name, slug, description)
  VALUES ('Dog Boarding', 'dog-boarding', 'Overnight stays') RETURNING id INTO boarding_id;
  INSERT INTO service_types (name, slug, description)
  VALUES ('Doggy Daycare', 'doggy-daycare', 'Daytime care') RETURNING id INTO daycare_id;

  -- 4. Create Users
  -- Admin
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@ruhrohretreat.com', crypt('rrradmin', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  RETURNING id INTO admin_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), admin_id, admin_id::text, format('{"sub":"%s","email":"%s"}', admin_id::text, 'admin@ruhrohretreat.com')::jsonb, 'email', now(), now(), now());

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (admin_id, 'admin@ruhrohretreat.com', 'Admin', 'User', 'ADMIN');


  -- Sitter: Johnny
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'johnny@ruhrohretreat.com', crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  RETURNING id INTO sitter_user_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), sitter_user_id, sitter_user_id::text, format('{"sub":"%s","email":"%s"}', sitter_user_id::text, 'johnny@ruhrohretreat.com')::jsonb, 'email', now(), now(), now());

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (sitter_user_id, 'johnny@ruhrohretreat.com', 'Johnny', 'Sitter', 'SITTER');

  INSERT INTO public.sitters (
    user_id, slug, tagline, avatar_url, hero_image_url, 
    bio, skills, home_environment, badges, policies, 
    lat, lng, is_active
  )
  VALUES (
    sitter_user_id,
    'johnny-irvine', -- slug (using id from json as slug, e.g. johnny-irvine)
    'Boutique staycations crafted in Irvine',
    '/sitters/sr-001/avatar.jpg',
    '/sitters/sr-001/hero.jpg',
    '["Hi! I’m Johnny, and I offer boutique-style staycations where your pup gets to enjoy luxury, calm, and personalized care in a home that feels like their own little retreat.","I’m all about creating a calm, structured environment where dogs actually feel safe and can relax from the moment they walk in. My home is set up with their comfort in mind—peaceful spaces to chill, cozy spots for naps, a fully fenced patio for outdoor time, and I keep everything clean and tidy throughout their stay.","I’ve been working with dogs for over 15 years, including time as a vet assistant, so I’m comfortable with medication, special needs, and senior pups. I recently left my corporate job to do this full time, which means your dog gets my full attention all day long.","Whether your pup is shy, super energetic, or somewhere in between, I meet them where they are. I build my day around what your dog needs—not the other way around. That means gentle introductions, consistent routines, calm group play, and lots of love and fun activities.","My Care Style","• Gentle, low-stress introductions to help dogs settle in","• Clear, consistent routines tailored to your pup’s comfort","• Calm group dynamics with close supervision","• Reading & supporting dog body language to keep interactions positive","• A peaceful environment with plenty of affection, enrichment, and relaxation","What Pet Parents Can Expect","• A warm, upscale home environment — never chaotic like a kennel","• Predictable daily rhythms that help dogs relax","• Thoughtful group play with close oversight","• Clean, tidy spaces (I deep-clean after every stay)","• Optional add-ons for enrichment, outings, or vacation-style fun","• Reliable photo/video updates so you always know how your pup is doing"]'::jsonb,
    '["15 years of experience","oral medication administration","injected medication administration","senior dog experience","special needs dog experience"]'::jsonb,
    '["No smoking—clean, fresh, and odor-free home.","1,200 sq ft apartment with open, comfortable living spaces","Two-bedroom setup with plenty of room for dogs to settle in","Dogs welcome on all furniture — beds, couches, and cozy spots","Peaceful, small-group environment (no children, no resident pets)","Fully fenced patio for secure outdoor breaks and fresh-air lounging","Close access to dog-friendly walking paths, biking trails, and a nearby dog park","Calm, structured setting with thoughtful rotations for multi-dog stays"]'::jsonb,
    '[{"key":"client-loyalty","title":"Client Loyalty","description":"Sitters with strong repeat bookings and long-term trusted client relationships.","earned":true},{"key":"five-star-consistency","title":"5-Star Consistency","description":"Sitters who consistently receive excellent reviews and provide a dependable guest experience.","earned":true}]'::jsonb,
    '{"cancellation":[{"label":"72+ hours","detail":"Free"},{"label":"24–72 hours","detail":"Charge $50"},{"label":"<24 hours","detail":"Charge $100"}],"extendedCare":[{"label":"Within 2 hours","detail":"No fee"},{"label":"2–4 hours late","detail":"$20 flat fee"},{"label":"4+ hours late","detail":"$30 flat fee"}]}'::jsonb,
    33.673033,
    -117.77879,
    true
  )
  RETURNING id INTO sitter_profile_id;

  -- Primary Services

  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile_id, boarding_id, 5000);

  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile_id, daycare_id, 5000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Sniffari Walk', 'structured scent, exploration walk', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'PAW-casso Painting', 'dog-safe art', 2000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Bubble Play Session', 'dog-safe bubbles — super easy & fun', 1000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Extended Walk', '20 min longer neighborhood walk', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Jogging Session', 'light jog for active dogs', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Dog Park Trip', 'supervised dog park visit', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Puzzle Feeder / Frozen Kong', 'custom stuffed frozen kong, puzzle feeder', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Puppuccino & Treat Outing', 'Puppuccino & Treat Outing', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'One-On-One Fetch', 'One-On-One Fetch', 1000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Bath & Blow Dry', 'Bath & Blow Dry', 4000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Massage & Brushing', 'Massage & Brushing', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Warm Towel Cuddle', 'Warm Towel Cuddle', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Teeth Brushing', 'Teeth Brushing', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Ear Cleaning', 'gentle ear wipe/clean', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Nail Trim', 'Nail Trim', 1000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Stuffed Frozen Kong Customization', 'choose flavors', 500);

  INSERT INTO sitter_discounts (sitter_id, min_days, percentage)
  VALUES (sitter_profile_id, 7, 8);

  INSERT INTO sitter_discounts (sitter_id, min_days, percentage)
  VALUES (sitter_profile_id, 14, 10);

  INSERT INTO sitter_discounts (sitter_id, min_days, percentage)
  VALUES (sitter_profile_id, 30, 15);

  -- Sitter: Trudy
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'trudy@ruhrohretreat.com', crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  RETURNING id INTO sitter_user_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), sitter_user_id, sitter_user_id::text, format('{"sub":"%s","email":"%s"}', sitter_user_id::text, 'trudy@ruhrohretreat.com')::jsonb, 'email', now(), now(), now());

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (sitter_user_id, 'trudy@ruhrohretreat.com', 'Trudy', 'Sitter', 'SITTER');

  INSERT INTO public.sitters (
    user_id, slug, tagline, avatar_url, hero_image_url, 
    bio, skills, home_environment, badges, policies, 
    lat, lng, is_active
  )
  VALUES (
    sitter_user_id,
    'trudy-wildomar', -- slug (using id from json as slug, e.g. johnny-irvine)
    'Lakeview adventures from a calm Wildomar home',
    '/sitters/sr-002/avatar.jpg',
    '/sitters/sr-002/hero.jpg',
    '["Hi, I’m Trudy — a lifelong dog person with years of hands-on experience caring for pups of all breeds, ages, and personalities.","As a full-time stay-at-home mom, caring for dogs has become one of my greatest joys. Over the years, friends, neighbors, and family naturally began turning to me as their “go-to” sitter because of my calm approach, gentle presence, and the way dogs settle in easily around me. Whether your pup is energetic, anxious, or brand new to being away from home, my goal is always the same: to help them feel safe, relaxed, and completely at ease during their stay.","My Care Style","I take a patient, loving, and attentive approach with every dog:","• Gentle, low-stress introductions that help pups settle in confidently","• Clear, comforting routines for meals, potty breaks, naps, and play","• Calm group dynamics—supervised closely and always based on each dog’s comfort","• Understanding each dog’s cues, personality, and energy level","• A peaceful home environment where shy, senior, or first-time-away pups feel secure","• Plenty of affection, enrichment, and relaxation time","• Whether your pup is outgoing, mellow, or somewhere in between, I adjust the pace so they feel understood and safe","What Pet Parents Can Expect","• A warm, family-style home environment—never chaotic like a kennel","• Predictable daily rhythms that help dogs relax","• Thoughtful, low-stress dog introductions","• Clean, comfort-focused spaces with cozy resting spots","• A secure outdoor area for fresh-air breaks and lounging","• Attentive supervision and companionship all day long","• Reliable photo/video updates (1–2 per day) so you always know how your pup is doing","• Optional add-ons, such as nature walks, cuddles, brushing, and treat outings","I genuinely treat every dog like they’re part of my own family. Whether your pup loves to trot around the yard or prefers cozy naps and gentle cuddles, I meet them exactly where they are so they feel loved, supported, and right at home.","I can’t wait to welcome your pup into my home and give them the care, comfort, and warmth they deserve. ✨🐾"]'::jsonb,
    '["40 years of experience","oral medication administration","senior dog experience","special needs dog experience"]'::jsonb,
    '["No smoking—clean, fresh, and odor-free home.","1,200 sq ft apartment with open, comfortable living spaces","Two-bedroom setup with plenty of room for dogs to relax, explore, and feel at ease","Three-bedroom layout that allows for calm separation when needed and peaceful group time","Two fully fenced yards — secure spaces for safe outdoor play, sniffing, and sunbathing","Peaceful small-group setting with Trudy’s three friendly resident dogs who help newcomers feel welcome","No children in the home, keeping the environment low-stress and predictable","Dogs allowed on furniture and beds — pups relax just like they would at home","Clean, comfortable spaces with soft bedding, cozy resting spots, and shaded outdoor areas","Plenty of supervised outdoor time in both yards throughout the day"]'::jsonb,
    '[{"key":"client-loyalty","title":"Client Loyalty","description":"Sitters with strong repeat bookings and long-term trusted client relationships.","earned":true},{"key":"five-star-consistency","title":"5-Star Consistency","description":"Sitters who consistently receive excellent reviews and provide a dependable guest experience.","earned":true}]'::jsonb,
    '{"cancellation":[{"label":"Free cancellation","detail":"until 72h before check-in"},{"label":"72–24h before","detail":"50% of booking"},{"label":"Within 24h","detail":"100% of first 2 nights"}],"extendedCare":[{"label":"Within 2 hours","detail":"No fee"},{"label":"2–4 hours late","detail":"$20 flat fee"},{"label":"4+ hours late","detail":"$30 flat fee"}]}'::jsonb,
    33.603568,
    -117.293535,
    true
  )
  RETURNING id INTO sitter_profile_id;

  -- Primary Services

  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile_id, boarding_id, 5000);

  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile_id, daycare_id, 5000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, '“Adventure Drive” Car Ride', 'window cracked, supervised—many dogs love the stimulation', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Bubble Play Session', 'dog-safe bubbles — super easy & fun', 1000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'One-On-One Fetch', 'One-On-One Fetch', 1000);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Massage & Brushing', 'Massage & Brushing', 1500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Warm Towel Cuddle', 'Warm Towel Cuddle', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Teeth Brushing', 'Teeth Brushing', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Ear Cleaning', 'gentle ear wipe/clean', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Stuffed Frozen Kong Customization', 'choose flavors', 500);

  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, 'Doggie Room Service Meal Topping', 'Sitter chooses items they are comfortable using — bone broth, veggie mix, etc.', 500);

  INSERT INTO sitter_discounts (sitter_id, min_days, percentage)
  VALUES (sitter_profile_id, 7, 10);

END $$;
