ALTER TABLE public.sitters
ADD COLUMN slug text UNIQUE,
ADD COLUMN tagline text,
ADD COLUMN avatar_url text,
ADD COLUMN hero_image_url text,
ADD COLUMN bio jsonb DEFAULT '[]'::jsonb,
ADD COLUMN skills jsonb DEFAULT '[]'::jsonb,
ADD COLUMN home_environment jsonb DEFAULT '[]'::jsonb,
ADD COLUMN badges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN policies jsonb DEFAULT '{}'::jsonb,
ADD COLUMN location_details jsonb DEFAULT '{}'::jsonb;
