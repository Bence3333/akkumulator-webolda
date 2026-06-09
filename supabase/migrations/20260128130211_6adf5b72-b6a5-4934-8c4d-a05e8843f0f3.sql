-- Add highlighted_description column to survey_section_config
ALTER TABLE public.survey_section_config 
ADD COLUMN IF NOT EXISTS highlighted_description TEXT;