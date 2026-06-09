-- Create table to store survey section configuration
CREATE TABLE public.survey_section_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  count_label text,
  question_label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_section_config ENABLE ROW LEVEL SECURITY;

-- Create policies - anyone can view, only admins can modify
CREATE POLICY "Anyone can view section config"
ON public.survey_section_config
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert section config"
ON public.survey_section_config
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update section config"
ON public.survey_section_config
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete section config"
ON public.survey_section_config
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default values for the two sections
INSERT INTO public.survey_section_config (section_key, title, description, count_label, question_label)
VALUES 
  ('property_owners', 'Beruházással érintett ingatlan tulajdonviszonyai', 'A pályázó személyén kívül, további tulajdonosok adatai:', 'További tulajdonosok száma:', NULL),
  ('beneficiaries', 'Haszonélvezeti jog', 'A beruházással érintett ingatlan haszonélvezőinek adatai:', 'Haszonélvezők száma:', 'A beruházással érintett ingatlan haszonélvezeti joggal terhelt:');

-- Create trigger for updated_at
CREATE TRIGGER update_survey_section_config_updated_at
BEFORE UPDATE ON public.survey_section_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();