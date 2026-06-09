-- Create table for storing FAQ items
CREATE TABLE public.faq_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read FAQs
CREATE POLICY "Anyone can view faq items"
ON public.faq_items
FOR SELECT
USING (true);

-- Anyone can insert FAQs (for admin mode)
CREATE POLICY "Anyone can insert faq items"
ON public.faq_items
FOR INSERT
WITH CHECK (true);

-- Anyone can update FAQs (for admin mode)
CREATE POLICY "Anyone can update faq items"
ON public.faq_items
FOR UPDATE
USING (true);

-- Anyone can delete FAQs (for admin mode)
CREATE POLICY "Anyone can delete faq items"
ON public.faq_items
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();