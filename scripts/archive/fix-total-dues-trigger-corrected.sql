-- Fix total_dues calculation with correct credit adjustment subtraction
-- Run this in your Supabase SQL editor

-- Create or replace function to calculate total dues (credit adjustment should subtract)
CREATE OR REPLACE FUNCTION calculate_total_dues()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total dues: season_dues + extra_jersey_dues + extra_trouser_dues - credit_adjustment
    NEW.total_dues = NEW.season_dues + NEW.extra_jersey_dues + NEW.extra_trouser_dues - NEW.credit_adjustment;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS calculate_total_dues_trigger ON member_dues;
CREATE TRIGGER calculate_total_dues_trigger
    BEFORE INSERT OR UPDATE ON member_dues
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_dues();

-- Update existing records to have correct total_dues (credit adjustment should subtract)
UPDATE member_dues 
SET total_dues = season_dues + extra_jersey_dues + extra_trouser_dues - credit_adjustment;
