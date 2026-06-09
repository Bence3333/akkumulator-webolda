-- Add preferred callback time columns
ALTER TABLE public.callback_requests 
ADD COLUMN preferred_day text DEFAULT 'weekday',
ADD COLUMN preferred_time text DEFAULT 'morning';

-- Allow deletion of callback_requests
CREATE POLICY "Anyone can delete callback requests" 
ON public.callback_requests 
FOR DELETE 
USING (true);

-- Allow deletion of quote_requests
CREATE POLICY "Anyone can delete quote requests" 
ON public.quote_requests 
FOR DELETE 
USING (true);