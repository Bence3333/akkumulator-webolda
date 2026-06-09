-- Create survey questions table
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text' CHECK (question_type IN ('text', 'multiple_choice')),
  options TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- Everyone can view questions
CREATE POLICY "Anyone can view survey questions"
ON public.survey_questions
FOR SELECT
USING (true);

-- Admins can insert questions
CREATE POLICY "Admins can insert survey questions"
ON public.survey_questions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update questions
CREATE POLICY "Admins can update survey questions"
ON public.survey_questions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete questions
CREATE POLICY "Admins can delete survey questions"
ON public.survey_questions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_survey_questions_updated_at
BEFORE UPDATE ON public.survey_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();