-- Create constraints and triggers after tables and indexes are created
-- Run this after creating tables and indexes

-- Add constraints
ALTER TABLE seasons ADD CONSTRAINT unique_season_year UNIQUE (year);
ALTER TABLE tournament_formats ADD CONSTRAINT unique_format_per_season UNIQUE (season_id, name);

-- Add trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournament_formats_updated_at BEFORE UPDATE ON tournament_formats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_dues_updated_at BEFORE UPDATE ON member_dues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_expenses_updated_at BEFORE UPDATE ON general_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
