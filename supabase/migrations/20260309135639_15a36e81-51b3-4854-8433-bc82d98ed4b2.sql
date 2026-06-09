
-- Add survey_id column to survey_questions (default 1 for existing data)
ALTER TABLE public.survey_questions ADD COLUMN survey_id integer NOT NULL DEFAULT 1;

-- Add survey_id column to survey_categories (default 1 for existing data)
ALTER TABLE public.survey_categories ADD COLUMN survey_id integer NOT NULL DEFAULT 1;

-- Add survey_id column to survey_section_config (default 1 for existing data)
ALTER TABLE public.survey_section_config ADD COLUMN survey_id integer NOT NULL DEFAULT 1;
