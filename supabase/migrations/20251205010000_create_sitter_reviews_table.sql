CREATE TABLE IF NOT EXISTS public.sitter_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sitter_id uuid REFERENCES public.sitters(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    pet_name text,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date date NOT NULL,
    text text NOT NULL,
    image_url text,
    source text DEFAULT 'Ruh-Roh Retreat',
    created_at timestamptz DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sitter_reviews_sitter_id ON public.sitter_reviews(sitter_id);
