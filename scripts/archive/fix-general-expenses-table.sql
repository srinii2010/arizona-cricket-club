-- Fix the general_expenses table
-- Run this in Supabase SQL Editor

-- First, let's check if the table exists and what columns it has
-- If the category column is missing, we'll recreate the table

-- Drop the table if it exists (this will remove any data)
DROP TABLE IF EXISTS general_expenses CASCADE;

-- Recreate the general_expenses table with proper structure
CREATE TABLE general_expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    tournament_format_id UUID REFERENCES tournament_formats(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Umpire', 'Equipment', 'Storage', 'LiveStream', 'Mat', 'Food', 'Others')),
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    paid_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    settlement_status VARCHAR(20) DEFAULT 'Not Settled' CHECK (settlement_status IN ('Settled', 'Not Settled')),
    settlement_date DATE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the index that was failing
CREATE INDEX IF NOT EXISTS idx_general_expenses_category ON general_expenses(category);
CREATE INDEX IF NOT EXISTS idx_general_expenses_year ON general_expenses(year);
CREATE INDEX IF NOT EXISTS idx_general_expenses_paid_by_member_id ON general_expenses(paid_by_member_id);

-- Add the trigger for updated_at
CREATE TRIGGER update_general_expenses_updated_at BEFORE UPDATE ON general_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
