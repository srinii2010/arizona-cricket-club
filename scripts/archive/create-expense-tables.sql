-- Create Expense Management and Season Management Tables
-- Run this script in your Supabase SQL editor

-- 1. Seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tournament formats table
CREATE TABLE IF NOT EXISTS tournament_formats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Member dues table
CREATE TABLE IF NOT EXISTS member_dues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    tournament_format_ids UUID[] NOT NULL DEFAULT '{}',
    season_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_jersey_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_trouser_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
    credit_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_dues DECIMAL(10,2) GENERATED ALWAYS AS (season_dues + extra_jersey_dues + extra_trouser_dues + credit_adjustment) STORED,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Not Paid' CHECK (payment_status IN ('Paid', 'Not Paid')),
    settlement_date DATE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. General expenses table
CREATE TABLE IF NOT EXISTS general_expenses (
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

-- 5. Due reminders table
CREATE TABLE IF NOT EXISTS due_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_dues_id UUID NOT NULL REFERENCES member_dues(id) ON DELETE CASCADE,
    reminder_date DATE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);
CREATE INDEX IF NOT EXISTS idx_tournament_formats_season_id ON tournament_formats(season_id);
CREATE INDEX IF NOT EXISTS idx_member_dues_member_id ON member_dues(member_id);
CREATE INDEX IF NOT EXISTS idx_member_dues_year ON member_dues(year);
CREATE INDEX IF NOT EXISTS idx_member_dues_payment_status ON member_dues(payment_status);
CREATE INDEX IF NOT EXISTS idx_general_expenses_year ON general_expenses(year);
CREATE INDEX IF NOT EXISTS idx_general_expenses_category ON general_expenses(category);
CREATE INDEX IF NOT EXISTS idx_general_expenses_paid_by_member_id ON general_expenses(paid_by_member_id);
CREATE INDEX IF NOT EXISTS idx_due_reminders_member_dues_id ON due_reminders(member_dues_id);
CREATE INDEX IF NOT EXISTS idx_due_reminders_status ON due_reminders(status);

-- Add constraints
ALTER TABLE seasons ADD CONSTRAINT unique_season_year UNIQUE (year);
ALTER TABLE tournament_formats ADD CONSTRAINT unique_format_per_season UNIQUE (season_id, name);
ALTER TABLE member_dues ADD CONSTRAINT unique_member_year_formats UNIQUE (member_id, year, tournament_format_ids);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_formats_updated_at BEFORE UPDATE ON tournament_formats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_dues_updated_at BEFORE UPDATE ON member_dues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_expenses_updated_at BEFORE UPDATE ON general_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO seasons (year, name, status) VALUES 
(2025, '2025 Season', 'Active'),
(2024, '2024 Season', 'Inactive');

INSERT INTO tournament_formats (season_id, name, description) VALUES 
((SELECT id FROM seasons WHERE year = 2025), 'T20Platinum', 'T20 Platinum Division'),
((SELECT id FROM seasons WHERE year = 2025), 'T40DivA', 'T40 Division A'),
((SELECT id FROM seasons WHERE year = 2025), 'T40DivB', 'T40 Division B'),
((SELECT id FROM seasons WHERE year = 2024), 'T20Platinum', 'T20 Platinum Division 2024'),
((SELECT id FROM seasons WHERE year = 2024), 'T40DivA', 'T40 Division A 2024');
