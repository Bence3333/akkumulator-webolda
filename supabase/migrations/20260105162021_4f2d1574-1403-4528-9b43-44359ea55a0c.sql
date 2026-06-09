-- Add package_code column to packages table
ALTER TABLE public.packages ADD COLUMN package_code TEXT;

-- Create package_brands table for editable brand filters
CREATE TABLE public.package_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.package_brands ENABLE ROW LEVEL SECURITY;

-- Everyone can read brands
CREATE POLICY "Anyone can view package brands" 
ON public.package_brands 
FOR SELECT 
USING (true);

-- Insert default brands
INSERT INTO public.package_brands (name, display_name, sort_order) VALUES
('deye', 'Deye', 1),
('huawei', 'Huawei', 2);