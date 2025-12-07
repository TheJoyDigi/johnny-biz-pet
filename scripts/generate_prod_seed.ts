
import fs from 'fs';
import path from 'path';

const sittersRaw = fs.readFileSync(path.join(process.cwd(), 'data/sitters.json'), 'utf-8');
const sitters = JSON.parse(sittersRaw);

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeJson(obj: any): string {
  if (obj === undefined || obj === null) return "'[]'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

let sql = `-- Production Seed Script
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

`;

sitters.forEach((sitter: any, index: number) => {
  const email = `${sitter.name.toLowerCase()}@ruhrohretreat.com`;
  const password = 'password123'; // Default password for sitters
  const firstName = sitter.name;
  const lastName = 'Sitter'; // Placeholder as JSON doesn't have last name easily separated usually

  sql += `
  -- Sitter: ${sitter.name}
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', '${email}', crypt('${password}', extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  RETURNING id INTO sitter_user_id;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), sitter_user_id, sitter_user_id::text, format('{"sub":"%s","email":"%s"}', sitter_user_id::text, '${email}')::jsonb, 'email', now(), now(), now());

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (sitter_user_id, '${email}', ${escapeSql(firstName)}, ${escapeSql(lastName)}, 'SITTER');

  INSERT INTO public.sitters (
    user_id, slug, tagline, avatar_url, hero_image_url, 
    bio, skills, home_environment, badges, policies, 
    lat, lng, is_active
  )
  VALUES (
    sitter_user_id,
    ${escapeSql(sitter.id)}, -- slug (using id from json as slug, e.g. johnny-irvine)
    ${escapeSql(sitter.tagline)},
    ${escapeSql(sitter.avatar)},
    ${escapeSql(sitter.heroImage)},
    ${escapeJson(sitter.bio)},
    ${escapeJson(sitter.skills)},
    ${escapeJson(sitter.homeEnvironment)},
    ${escapeJson(sitter.badges)},
    ${escapeJson(sitter.policies)},
    ${sitter.locations?.[0]?.lat || 'NULL'},
    ${sitter.locations?.[0]?.lng || 'NULL'},
    true
  )
  RETURNING id INTO sitter_profile_id;

  -- Primary Services
`;

  // Process Primary Services
  if (sitter.services?.primary) {
      sitter.services.primary.forEach((svc: any) => {
          let typeVar = 'boarding_id';
          if (svc.name.toLowerCase().includes('daycare')) typeVar = 'daycare_id';
          
          const priceMatch = svc.price?.match(/\$(\d+)/);
          const priceCents = priceMatch ? parseInt(priceMatch[1]) * 100 : 0;
          
          sql += `
  INSERT INTO sitter_primary_services (sitter_id, service_type_id, price_cents)
  VALUES (sitter_profile_id, ${typeVar}, ${priceCents});
`;
      });
  }

  // Process Addons
  if (sitter.services?.addOns) {
      sitter.services.addOns.forEach((cat: any) => {
          cat.items.forEach((item: any) => {
             const priceMatch = item.price?.match(/\$(\d+)/);
             const priceCents = priceMatch ? parseInt(priceMatch[1]) * 100 : 0;
             sql += `
  INSERT INTO sitter_addons (sitter_id, name, description, price_cents)
  VALUES (sitter_profile_id, ${escapeSql(item.name)}, ${escapeSql(item.description || item.name)}, ${priceCents});
`;
          });
      });
  }

  // Process Discounts
    if (sitter.discounts) {
      // Length of stay
      sitter.discounts.lengthOfStay?.forEach((d: any) => {
          // Parse "7-13 nights", "14+ nights"
          let minDays = 0;
          if (d.label.includes('+')) {
              minDays = parseInt(d.label);
          } else if (d.label.includes('–') || d.label.includes('-')) { // handles en-dash or hyphen
               const parts = d.label.split(/[–-]/);
               minDays = parseInt(parts[0]);
          }
          
          const pctMatch = d.detail.match(/(\d+)%/);
          const percentage = pctMatch ? parseInt(pctMatch[1]) : 0;
          
          if (minDays > 0 && percentage > 0) {
              sql += `
  INSERT INTO sitter_discounts (sitter_id, min_days, percentage)
  VALUES (sitter_profile_id, ${minDays}, ${percentage});
`;
          }
      });
  }

});

sql += `
END $$;
`;

fs.writeFileSync(path.join(process.cwd(), 'supabase/seed_prod.sql'), sql);
console.log('Production seed script generated at supabase/seed_prod.sql');
