
-- Add subcategory column to packages
ALTER TABLE packages ADD COLUMN subcategory text DEFAULT 'akksi1';

-- Create subcategory options table
CREATE TABLE package_subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  display_name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE package_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view package subcategories" ON package_subcategories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert package subcategories" ON package_subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update package subcategories" ON package_subcategories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete package subcategories" ON package_subcategories FOR DELETE USING (true);

-- Insert default subcategories
INSERT INTO package_subcategories (name, display_name, sort_order) VALUES
('akksi1', 'Akksi 1', 1),
('inverter2', 'Inverter 2', 2),
('akksi3', 'Akksi 3', 3);
