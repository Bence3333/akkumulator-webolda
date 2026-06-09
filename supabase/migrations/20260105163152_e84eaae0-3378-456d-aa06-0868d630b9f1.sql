-- Add INSERT, UPDATE, DELETE policies for package_brands table
CREATE POLICY "Anyone can insert package brands" 
ON public.package_brands 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update package brands" 
ON public.package_brands 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete package brands" 
ON public.package_brands 
FOR DELETE 
USING (true);