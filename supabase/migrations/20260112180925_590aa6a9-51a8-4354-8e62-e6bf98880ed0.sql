-- Create battery options table for packages
CREATE TABLE public.package_battery_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier TEXT NOT NULL DEFAULT '0 Ft',
  original_price_modifier TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.package_battery_options ENABLE ROW LEVEL SECURITY;

-- Everyone can read battery options
CREATE POLICY "Anyone can view battery options" 
ON public.package_battery_options 
FOR SELECT 
USING (true);

-- Only authenticated users can manage (admins will be filtered in app)
CREATE POLICY "Authenticated users can insert battery options" 
ON public.package_battery_options 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update battery options" 
ON public.package_battery_options 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete battery options" 
ON public.package_battery_options 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX idx_battery_options_package_id ON public.package_battery_options(package_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_battery_options_updated_at
BEFORE UPDATE ON public.package_battery_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();