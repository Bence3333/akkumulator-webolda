-- Add description field to survey_questions for tooltip hints
ALTER TABLE public.survey_questions 
ADD COLUMN description TEXT DEFAULT NULL;