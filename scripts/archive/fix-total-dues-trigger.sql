-- Fix total_dues calculation with trigger
-- Run this in your Supabase SQL editor

-- First, make sure total_dues column is not generated
ALTER TABLE member_dues ALTER COLUMN total_dues DROP DEFAULT;

-- Create or replace function to calculate total dues
CREATE OR REPLACE FUNCTION calculate_total_dues()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total dues: season_dues + extra_jersey_dues + extra_trouser_dues - credit_adjustment
    NEW.total_dues = NEW.season_dues + NEW.extra_jersey_dues + NEW.extra_trouser_dues - NEW.credit_adjustment;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate total_dues on insert and update
DROP TRIGGER IF EXISTS calculate_total_dues_trigger ON member_dues;
CREATE TRIGGER calculate_total_dues_trigger
    BEFORE INSERT OR UPDATE ON member_dues
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_dues();

-- Update existing records to have correct total_dues
UPDATE member_dues 
SET total_dues = season_dues + extra_jersey_dues + extra_trouser_dues - credit_adjustment
WHERE total_dues IS NULL OR total_dues = 0;
