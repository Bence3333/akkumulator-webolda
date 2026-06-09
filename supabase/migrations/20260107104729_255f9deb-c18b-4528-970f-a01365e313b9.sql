-- Drop the overly permissive policies on packages
DROP POLICY IF EXISTS "Anyone can insert packages" ON public.packages;
DROP POLICY IF EXISTS "Anyone can update packages" ON public.packages;
DROP POLICY IF EXISTS "Anyone can delete packages" ON public.packages;

-- Create admin-only policies for inserting, updating, and deleting packages
CREATE POLICY "Admins can insert packages" 
ON public.packages 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update packages" 
ON public.packages 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete packages" 
ON public.packages 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));