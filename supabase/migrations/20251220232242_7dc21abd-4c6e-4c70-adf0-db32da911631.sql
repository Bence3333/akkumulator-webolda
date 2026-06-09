-- Add original_price column for the "before" price
ALTER TABLE public.packages ADD COLUMN original_price TEXT NOT NULL DEFAULT '';

-- Update existing packages with a default original price
UPDATE public.packages SET original_price = '' WHERE original_price IS NULL;