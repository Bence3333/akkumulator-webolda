-- Drop the overly permissive policies on quote_requests
DROP POLICY IF EXISTS "Anyone can view quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can update quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Anyone can delete quote requests" ON public.quote_requests;

-- Create admin-only policies for viewing, updating, and deleting quote requests
CREATE POLICY "Admins can view quote requests" 
ON public.quote_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quote requests" 
ON public.quote_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete quote requests" 
ON public.quote_requests 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));