-- Remove the old restrictive check constraint on question_type
ALTER TABLE public.survey_questions 
DROP CONSTRAINT IF EXISTS survey_questions_question_type_check;

-- Add new constraint that allows all the question types we support
ALTER TABLE public.survey_questions 
ADD CONSTRAINT survey_questions_question_type_check 
CHECK (question_type IN ('text', 'multiple_choice', 'phone', 'date', 'number', 'email'));