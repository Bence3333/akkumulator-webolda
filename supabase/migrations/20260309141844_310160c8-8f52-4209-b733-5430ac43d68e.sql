ALTER TABLE public.survey_questions
DROP CONSTRAINT IF EXISTS survey_questions_question_type_check;

ALTER TABLE public.survey_questions
ADD CONSTRAINT survey_questions_question_type_check
CHECK (
  question_type = ANY (
    ARRAY[
      'text'::text,
      'multiple_choice'::text,
      'phone'::text,
      'date'::text,
      'number'::text,
      'email'::text,
      'ownership_share'::text,
      'file_upload'::text
    ]
  )
);