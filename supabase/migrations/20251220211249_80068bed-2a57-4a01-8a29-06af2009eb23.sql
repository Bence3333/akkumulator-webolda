-- Add brand column to packages table for Deye/Huawei filtering
ALTER TABLE public.packages ADD COLUMN brand TEXT NOT NULL DEFAULT 'deye';

-- Update existing packages with brands
UPDATE public.packages SET brand = 'deye' WHERE sort_order IN (1, 2);
UPDATE public.packages SET brand = 'huawei' WHERE sort_order = 3;