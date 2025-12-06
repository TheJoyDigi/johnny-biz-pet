-- 1. Create service_types table
create table if not exists public.service_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  created_at timestamptz default now()
);

-- 2. Create sitter_primary_services table
create table if not exists public.sitter_primary_services (
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid references public.sitters(id) on delete cascade not null,
  service_type_id uuid references public.service_types(id) on delete cascade not null,
  price_cents integer not null,
  created_at timestamptz default now(),
  unique(sitter_id, service_type_id)
);

-- 3. Seed Service Types
insert into public.service_types (name, slug, description)
values
('Dog Boarding', 'dog-boarding', 'Boutique overnight stays with cozy suites, hourly wellness checks, and 24/7 supervision.'),
('Doggy Daycare', 'doggy-daycare', 'Structured daytime care with enrichment walks, rest dens, and constant communication.')
on conflict (slug) do nothing;

-- 4. Migrate Data
do $$
declare
  boarding_id uuid;
  daycare_id uuid;
begin
  select id into boarding_id from public.service_types where slug = 'dog-boarding';
  select id into daycare_id from public.service_types where slug = 'doggy-daycare';

  -- Boarding
  insert into public.sitter_primary_services (sitter_id, service_type_id, price_cents)
  select id, boarding_id, base_rate_cents
  from public.sitters
  where base_rate_cents is not null
  on conflict (sitter_id, service_type_id) do nothing;

  -- Daycare
  insert into public.sitter_primary_services (sitter_id, service_type_id, price_cents)
  select id, daycare_id, base_rate_cents
  from public.sitters
  where base_rate_cents is not null
  on conflict (sitter_id, service_type_id) do nothing;
end $$;

-- 5. Update RPC to use new tables (returning Boarding Price as "base_rate_cents" for backward logic)
CREATE OR REPLACE FUNCTION public.search_sitters_nearby(user_lat double precision, user_lng double precision, radius_meters double precision DEFAULT 50000)
 RETURNS TABLE(id uuid, slug text, first_name character varying, last_name character varying, avatar_url text, base_rate_cents integer, lat double precision, lng double precision, dist_meters double precision)
 LANGUAGE sql
AS $function$
    SELECT
        s.id,
        s.slug,
        u.first_name,
        u.last_name,
        s.avatar_url,
        COALESCE(
            (
                SELECT price_cents 
                FROM public.sitter_primary_services sps 
                JOIN public.service_types st ON sps.service_type_id = st.id 
                WHERE sps.sitter_id = s.id AND st.slug = 'dog-boarding' 
                LIMIT 1
            ), 
            0 -- Fallback if no price found
        ) as base_rate_cents,
        s.lat,
        s.lng,
        ST_Distance(s.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::GEOGRAPHY) AS dist_meters
    FROM
        public.sitters s
    JOIN
        public.users u ON s.user_id = u.id
    WHERE
        ST_DWithin(s.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::GEOGRAPHY, radius_meters)
        AND s.is_active = true
    ORDER BY
        dist_meters ASC;
$function$;

-- 6. Drop base_rate_cents from sitters
alter table public.sitters drop column if exists base_rate_cents;
