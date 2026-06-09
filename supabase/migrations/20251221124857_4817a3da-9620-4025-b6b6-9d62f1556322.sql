-- Create storage bucket for custom icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom-icons', 'custom-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view icons
CREATE POLICY "Icons are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'custom-icons');

-- Allow anyone to upload icons (for admin use)
CREATE POLICY "Anyone can upload icons" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'custom-icons');

-- Allow anyone to update icons
CREATE POLICY "Anyone can update icons" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'custom-icons');

-- Allow anyone to delete icons
CREATE POLICY "Anyone can delete icons" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'custom-icons');