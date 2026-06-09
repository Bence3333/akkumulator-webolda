-- Create survey categories table
CREATE TABLE public.survey_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category reference to questions
ALTER TABLE public.survey_questions 
ADD COLUMN category_id UUID REFERENCES public.survey_categories(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.survey_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view survey categories" 
ON public.survey_categories 
FOR SELECT 
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert survey categories" 
ON public.survey_categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update survey categories" 
ON public.survey_categories 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete survey categories" 
ON public.survey_categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_survey_categories_updated_at
BEFORE UPDATE ON public.survey_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();