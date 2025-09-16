-- Insert sample data for testing
-- Run this in Supabase SQL Editor

-- Insert sample seasons
INSERT INTO seasons (year, name, status) VALUES 
(2025, '2025 Season', 'Active'),
(2024, '2024 Season', 'Inactive')
ON CONFLICT (year) DO NOTHING;

-- Insert sample tournament formats
INSERT INTO tournament_formats (season_id, name, description) VALUES 
((SELECT id FROM seasons WHERE year = 2025), 'T20Platinum', 'T20 Platinum Division'),
((SELECT id FROM seasons WHERE year = 2025), 'T40DivA', 'T40 Division A'),
((SELECT id FROM seasons WHERE year = 2025), 'T40DivB', 'T40 Division B'),
((SELECT id FROM seasons WHERE year = 2024), 'T20Platinum', 'T20 Platinum Division 2024'),
((SELECT id FROM seasons WHERE year = 2024), 'T40DivA', 'T40 Division A 2024')
ON CONFLICT (season_id, name) DO NOTHING;