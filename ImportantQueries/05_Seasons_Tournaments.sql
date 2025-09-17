-- =====================================================
-- SEASONS & TOURNAMENT MANAGEMENT QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Get all seasons with tournament formats
SELECT s.*, 
       tf.id as format_id, tf.name as format_name, tf.description as format_description
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
ORDER BY s.year DESC;

-- 2. Get active seasons
SELECT s.*, 
       tf.id as format_id, tf.name as format_name
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
WHERE s.status = 'Active'
ORDER BY s.year DESC;

-- 3. Get season by year
SELECT s.*, 
       tf.id as format_id, tf.name as format_name
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
WHERE s.year = 2024
ORDER BY tf.name;

-- 4. Get specific season by ID
SELECT s.*, 
       tf.id as format_id, tf.name as format_name, tf.description as format_description
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
WHERE s.id = 'season-id'
ORDER BY tf.name;

-- 5. Add new season
INSERT INTO seasons (year, name, status, last_updated_by)
VALUES (2024, '2024-25 Season', 'Active', 'srinii2005@gmail.com');

-- 6. Update season
UPDATE seasons 
SET name = 'Updated Season Name', 
    status = 'Inactive',
    last_updated_by = 'srinii2005@gmail.com'
WHERE id = 'season-id';

-- 7. Delete season (check for dependencies first)
-- Check if season has member dues
SELECT COUNT(*) as member_dues_count
FROM member_dues 
WHERE year = (SELECT year FROM seasons WHERE id = 'season-id');

-- Check if season has general expenses
SELECT COUNT(*) as general_expenses_count
FROM general_expenses 
WHERE year = (SELECT year FROM seasons WHERE id = 'season-id');

-- Delete season (only if no dependencies)
DELETE FROM seasons 
WHERE id = 'season-id';

-- 8. Get all tournament formats with season info
SELECT tf.*, s.year as season_year, s.name as season_name
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
ORDER BY s.year DESC, tf.name;

-- 9. Get tournament formats by season
SELECT tf.*, s.year as season_year
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
WHERE tf.season_id = 'season-id'
ORDER BY tf.name;

-- 10. Get specific tournament format
SELECT tf.*, s.year as season_year, s.name as season_name
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
WHERE tf.id = 'format-id';

-- 11. Add new tournament format
INSERT INTO tournament_formats (season_id, name, description)
VALUES ('season-id', 'T20 Format', 'Twenty20 cricket format');

-- 12. Update tournament format
UPDATE tournament_formats 
SET name = 'Updated Format Name', 
    description = 'Updated description'
WHERE id = 'format-id';

-- 13. Delete tournament format (check for dependencies first)
-- Check if format is used in member dues
SELECT COUNT(*) as member_dues_count
FROM member_dues 
WHERE tournament_format_ids @> '["format-id"]';

-- Check if format is used in general expenses
SELECT COUNT(*) as general_expenses_count
FROM general_expenses 
WHERE tournament_format_id = 'format-id';

-- Delete tournament format (only if no dependencies)
DELETE FROM tournament_formats 
WHERE id = 'format-id';

-- 14. Get seasons by status
SELECT s.*, 
       COUNT(tf.id) as format_count
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
WHERE s.status = 'Active'
GROUP BY s.id, s.year, s.name, s.status, s.created_at, s.last_updated_by
ORDER BY s.year DESC;

-- 15. Get tournament formats by name
SELECT tf.*, s.year as season_year, s.name as season_name
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
WHERE tf.name ILIKE '%T20%'
ORDER BY s.year DESC, tf.name;

-- 16. Get current season
SELECT s.*, 
       tf.id as format_id, tf.name as format_name
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
WHERE s.status = 'Active'
  AND s.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY tf.name;

-- 17. Get season statistics
SELECT s.year, s.name, s.status,
       COUNT(tf.id) as format_count,
       COUNT(md.id) as member_dues_count,
       COUNT(ge.id) as general_expenses_count
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
LEFT JOIN member_dues md ON s.year = md.year
LEFT JOIN general_expenses ge ON s.year = ge.year
GROUP BY s.id, s.year, s.name, s.status
ORDER BY s.year DESC;

-- 18. Get tournament format statistics
SELECT tf.name, tf.description,
       s.year as season_year,
       COUNT(md.id) as member_dues_count,
       COUNT(ge.id) as general_expenses_count
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
LEFT JOIN member_dues md ON tf.id = ANY(md.tournament_format_ids)
LEFT JOIN general_expenses ge ON tf.id = ge.tournament_format_id
GROUP BY tf.id, tf.name, tf.description, s.year
ORDER BY s.year DESC, tf.name;

-- 19. Get recent seasons
SELECT s.*, 
       COUNT(tf.id) as format_count
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
GROUP BY s.id, s.year, s.name, s.status, s.created_at, s.last_updated_by
ORDER BY s.created_at DESC
LIMIT 5;

-- 20. Get recent tournament formats
SELECT tf.*, s.year as season_year, s.name as season_name
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
ORDER BY tf.created_at DESC
LIMIT 10;
