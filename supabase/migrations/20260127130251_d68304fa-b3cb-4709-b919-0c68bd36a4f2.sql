-- Fix survey_questions policies: change from RESTRICTIVE to PERMISSIVE
-- First drop the existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Admins can delete survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Admins can insert survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Admins can update survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Anyone can view survey questions" ON public.survey_questions;

-- Create new PERMISSIVE policies
CREATE POLICY "Anyone can view survey questions" 
ON public.survey_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert survey questions" 
ON public.survey_questions 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey questions" 
ON public.survey_questions 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey questions" 
ON public.survey_questions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Fix survey_categories policies similarly
DROP POLICY IF EXISTS "Admins can delete survey categories" ON public.survey_categories;
DROP POLICY IF EXISTS "Admins can insert survey categories" ON public.survey_categories;
DROP POLICY IF EXISTS "Admins can update survey categories" ON public.survey_categories;
DROP POLICY IF EXISTS "Anyone can view survey categories" ON public.survey_categories;

CREATE POLICY "Anyone can view survey categories" 
ON public.survey_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert survey categories" 
ON public.survey_categories 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update survey categories" 
ON public.survey_categories 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete survey categories" 
ON public.survey_categories 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));