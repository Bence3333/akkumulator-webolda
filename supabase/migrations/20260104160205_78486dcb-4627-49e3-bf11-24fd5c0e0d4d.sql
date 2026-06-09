-- Add inverter_brand column to quote_requests table
ALTER TABLE public.quote_requests
ADD COLUMN inverter_brand text;