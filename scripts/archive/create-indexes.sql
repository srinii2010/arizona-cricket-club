-- Create indexes after tables are created
-- Run this after the step-by-step table creation

-- Seasons indexes
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- Tournament formats indexes
CREATE INDEX IF NOT EXISTS idx_tournament_formats_season_id ON tournament_formats(season_id);

-- Member dues indexes
CREATE INDEX IF NOT EXISTS idx_member_dues_member_id ON member_dues(member_id);
CREATE INDEX IF NOT EXISTS idx_member_dues_year ON member_dues(year);
CREATE INDEX IF NOT EXISTS idx_member_dues_payment_status ON member_dues(payment_status);

-- General expenses indexes
CREATE INDEX IF NOT EXISTS idx_general_expenses_year ON general_expenses(year);
CREATE INDEX IF NOT EXISTS idx_general_expenses_category ON general_expenses(category);
CREATE INDEX IF NOT EXISTS idx_general_expenses_paid_by_member_id ON general_expenses(paid_by_member_id);

-- Due reminders indexes
CREATE INDEX IF NOT EXISTS idx_due_reminders_member_dues_id ON due_reminders(member_dues_id);
CREATE INDEX IF NOT EXISTS idx_due_reminders_status ON due_reminders(status);
