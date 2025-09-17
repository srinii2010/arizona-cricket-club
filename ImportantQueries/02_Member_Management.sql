-- =====================================================
-- MEMBER MANAGEMENT QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Get all members with team information
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
ORDER BY m.first_name;

-- 2. Get members by team
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.team_id = 'team-id'
ORDER BY m.first_name;

-- 3. Get specific member by ID
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.id = 'member-id';

-- 4. Search member by email
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.email = 'srinii2005@gmail.com';

-- 5. Search member by name
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.first_name ILIKE '%Srinivas%' 
   OR m.last_name ILIKE '%Srinivas%';

-- 6. Add new member
INSERT INTO members (first_name, last_name, email, phone, team_id, role, date_of_birth, gender, last_updated_by)
VALUES ('Srinivas', 'Iyer', 'srinii2005@gmail.com', '123-456-7890', 'team-id', 'player', '1990-01-01', 'male', 'admin@example.com');

-- 7. Update member information
UPDATE members 
SET first_name = 'Srinivas', 
    last_name = 'Iyer', 
    email = 'srinii2005@gmail.com',
    phone = '987-654-3210'
WHERE id = 'member-id';

-- 8. Update member team
UPDATE members 
SET team_id = 'new-team-id',
    last_updated_by = 'admin@example.com'
WHERE id = 'member-id';

-- 9. Update member role
UPDATE members 
SET role = 'captain',
    last_updated_by = 'admin@example.com'
WHERE id = 'member-id';

-- 10. Delete member
DELETE FROM members 
WHERE id = 'member-id';

-- 11. Get all teams
SELECT id, name 
FROM teams 
ORDER BY name;

-- 12. Add new team
INSERT INTO teams (name) 
VALUES ('New Team Name');

-- 13. Update team name
UPDATE teams 
SET name = 'Updated Team Name' 
WHERE id = 'team-id';

-- 14. Delete team
DELETE FROM teams 
WHERE id = 'team-id';

-- 15. Get members by role
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.role = 'player'
ORDER BY m.first_name;

-- 16. Get members by gender
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.gender = 'male'
ORDER BY m.first_name;

-- 17. Count members by team
SELECT t.name as team_name, 
       COUNT(m.id) as member_count
FROM teams t
LEFT JOIN members m ON t.id = m.team_id
GROUP BY t.id, t.name
ORDER BY member_count DESC;

-- 18. Count members by role
SELECT role, 
       COUNT(*) as member_count
FROM members 
GROUP BY role
ORDER BY member_count DESC;

-- 19. Recent member additions
SELECT first_name, last_name, email, 
       created_at
FROM members 
ORDER BY created_at DESC
LIMIT 10;

-- 20. Search members by phone
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.phone = '123-456-7890';
