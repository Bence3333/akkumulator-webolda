-- Create function to update timestamps first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop existing types if they exist (from partial migrations)
DROP TYPE IF EXISTS public.quote_status CASCADE;
DROP TYPE IF EXISTS public.roof_type CASCADE;
DROP TABLE IF EXISTS public.quote_requests CASCADE;

-- Create enum for quote request status
CREATE TYPE public.quote_status AS ENUM ('pending', 'in_progress', 'closed');

-- Create enum for roof types  
CREATE TYPE public.roof_type AS ENUM ('flat', 'sheet', 'standing_seam', 'shingle', 'tile');

-- Create quote requests table
CREATE TABLE public.quote_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    has_solar BOOLEAN NOT NULL,
    
    -- Contact info (required for all)
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    notes TEXT,
    
    -- Solar-specific fields (only for those without solar)
    roof_angle INTEGER,
    roof_orientation TEXT,
    roof_type roof_type,
    annual_consumption INTEGER,
    
    -- Images
    images TEXT[] DEFAULT '{}',
    
    -- Status and timestamps
    status quote_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can insert quotes (public form)
CREATE POLICY "Anyone can submit quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (true);

-- Allow viewing quotes
CREATE POLICY "Anyone can view quote requests"
ON public.quote_requests
FOR SELECT
USING (true);

-- Allow updates for status changes
CREATE POLICY "Anyone can update quote requests"
ON public.quote_requests
FOR UPDATE
USING (true);

-- Create storage bucket for quote images (ignore if exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quote-images', 'quote-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop if exists first)
DROP POLICY IF EXISTS "Anyone can upload quote images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view quote images" ON storage.objects;

CREATE POLICY "Anyone can upload quote images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'quote-images');

CREATE POLICY "Anyone can view quote images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'quote-images');

-- Create trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();