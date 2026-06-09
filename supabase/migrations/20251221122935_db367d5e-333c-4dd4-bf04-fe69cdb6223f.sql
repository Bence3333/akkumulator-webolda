-- Create table for footer links
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for contact items (extra contact info)
CREATE TABLE public.contact_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL DEFAULT 'info',
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for footer_links
CREATE POLICY "Anyone can view footer links" ON public.footer_links FOR SELECT USING (true);
CREATE POLICY "Anyone can insert footer links" ON public.footer_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update footer links" ON public.footer_links FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete footer links" ON public.footer_links FOR DELETE USING (true);

-- RLS policies for contact_items
CREATE POLICY "Anyone can view contact items" ON public.contact_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contact items" ON public.contact_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contact items" ON public.contact_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete contact items" ON public.contact_items FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_footer_links_updated_at
BEFORE UPDATE ON public.footer_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_items_updated_at
BEFORE UPDATE ON public.contact_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();