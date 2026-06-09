-- Create table for storing editable content
CREATE TABLE public.editable_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key text UNIQUE NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.editable_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read content
CREATE POLICY "Anyone can view editable content"
ON public.editable_content
FOR SELECT
USING (true);

-- Anyone can insert content (for admin mode)
CREATE POLICY "Anyone can insert editable content"
ON public.editable_content
FOR INSERT
WITH CHECK (true);

-- Anyone can update content (for admin mode)
CREATE POLICY "Anyone can update editable content"
ON public.editable_content
FOR UPDATE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_editable_content_updated_at
BEFORE UPDATE ON public.editable_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();