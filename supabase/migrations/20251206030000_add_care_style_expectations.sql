ALTER TABLE public.sitters
ADD COLUMN IF NOT EXISTS care_style jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS parent_expectations jsonb DEFAULT '[]'::jsonb;
