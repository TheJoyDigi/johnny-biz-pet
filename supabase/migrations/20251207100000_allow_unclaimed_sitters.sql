ALTER TABLE public.sitters ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.sitters ADD COLUMN first_name TEXT;
ALTER TABLE public.sitters ADD COLUMN last_name TEXT;
ALTER TABLE public.sitters ADD COLUMN contact_email TEXT;
