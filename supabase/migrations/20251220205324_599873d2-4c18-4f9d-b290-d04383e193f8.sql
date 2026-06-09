-- Create packages table for storing package data
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  highlighted BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read packages (public content)
CREATE POLICY "Packages are viewable by everyone" 
ON public.packages 
FOR SELECT 
USING (true);

-- Allow anyone to insert packages (admin check will be done in frontend)
CREATE POLICY "Anyone can insert packages" 
ON public.packages 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update packages (admin check will be done in frontend)
CREATE POLICY "Anyone can update packages" 
ON public.packages 
FOR UPDATE 
USING (true);

-- Allow anyone to delete packages (admin check will be done in frontend)
CREATE POLICY "Anyone can delete packages" 
ON public.packages 
FOR DELETE 
USING (true);

-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public) VALUES ('package-images', 'package-images', true);

-- Storage policies for package images
CREATE POLICY "Package images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'package-images');

CREATE POLICY "Anyone can upload package images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'package-images');

CREATE POLICY "Anyone can update package images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'package-images');

CREATE POLICY "Anyone can delete package images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'package-images');

-- Insert default packages
INSERT INTO public.packages (title, description, price, features, highlighted, sort_order) VALUES
('Alap Csomag', 'Ideális kisebb háztartásoknak', '1.5M Ft-tól', ARRAY['5 kW napelem rendszer', '10 kWh akkumulátor', 'Alap monitoring', '5 év garancia'], false, 1),
('Prémium Csomag', 'Átlagos családi házakhoz', '2.5M Ft-tól', ARRAY['10 kW napelem rendszer', '15 kWh akkumulátor', 'Okos monitoring', '10 év garancia', 'Éves karbantartás'], true, 2),
('Professzionális', 'Nagy energiaigényű otthonoknak', '4M Ft-tól', ARRAY['15+ kW napelem rendszer', '20+ kWh akkumulátor', 'Prémium monitoring', '15 év garancia', 'Prioritás support'], false, 3);