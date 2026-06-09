-- Create storage bucket for survey file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-attachments', 'survey-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload survey attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'survey-attachments');

-- Allow anyone to view files in the bucket  
CREATE POLICY "Anyone can view survey attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'survey-attachments');