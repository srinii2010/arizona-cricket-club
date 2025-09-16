-- Add audit trail fields (created_by and last_updated_by) to all relevant tables
-- Run this script in your Supabase SQL editor

-- 1. Add audit fields to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 2. Add audit fields to teams table  
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 3. Add audit fields to seasons table
ALTER TABLE seasons
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 4. Add audit fields to tournament_formats table
ALTER TABLE tournament_formats
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 5. Add audit fields to member_dues table
ALTER TABLE member_dues
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 6. Add audit fields to general_expenses table
ALTER TABLE general_expenses
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 7. Add audit fields to due_reminders table
ALTER TABLE due_reminders
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- 8. Add audit fields to users table (for access management)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);

-- Create indexes for better performance on audit fields
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);
CREATE INDEX IF NOT EXISTS idx_members_last_updated_by ON members(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_last_updated_by ON teams(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_seasons_created_by ON seasons(created_by);
CREATE INDEX IF NOT EXISTS idx_seasons_last_updated_by ON seasons(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_tournament_formats_created_by ON tournament_formats(created_by);
CREATE INDEX IF NOT EXISTS idx_tournament_formats_last_updated_by ON tournament_formats(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_member_dues_created_by ON member_dues(created_by);
CREATE INDEX IF NOT EXISTS idx_member_dues_last_updated_by ON member_dues(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_general_expenses_created_by ON general_expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_general_expenses_last_updated_by ON general_expenses(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_due_reminders_created_by ON due_reminders(created_by);
CREATE INDEX IF NOT EXISTS idx_due_reminders_last_updated_by ON due_reminders(last_updated_by);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_users_last_updated_by ON users(last_updated_by);
