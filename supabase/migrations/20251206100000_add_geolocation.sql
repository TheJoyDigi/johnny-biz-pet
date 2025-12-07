-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ensure lat/lng columns exist (safeguard)
ALTER TABLE public.sitters ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.sitters ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Add location column
ALTER TABLE public.sitters ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Create Index
CREATE INDEX IF NOT EXISTS sitters_location_idx ON public.sitters USING GIST (location);

-- Function to sync location
CREATE OR REPLACE FUNCTION public.sync_sitter_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::GEOGRAPHY;
    ELSE
        NEW.location = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync location
DROP TRIGGER IF EXISTS sync_sitter_location_trigger ON public.sitters;
CREATE TRIGGER sync_sitter_location_trigger
BEFORE INSERT OR UPDATE OF lat, lng ON public.sitters
FOR EACH ROW
EXECUTE FUNCTION public.sync_sitter_location();

-- Backfill existing data
UPDATE public.sitters
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::GEOGRAPHY
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Search RPC Function
CREATE OR REPLACE FUNCTION search_sitters_nearby(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 50000
)
RETURNS TABLE (
    id UUID,
    slug TEXT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    avatar_url TEXT,
    base_rate_cents INT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    dist_meters DOUBLE PRECISION
)
LANGUAGE sql
AS $$
    SELECT
        s.id,
        s.slug,
        u.first_name,
        u.last_name,
        s.avatar_url,
        s.base_rate_cents,
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
$$;
