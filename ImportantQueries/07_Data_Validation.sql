-- =====================================================
-- DATA VALIDATION & INTEGRITY QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Check for orphaned records
-- Orphaned member dues (member doesn't exist)
SELECT md.id, md.member_id, md.year, md.total_dues
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE m.id IS NULL;

-- 2. Orphaned general expenses (member doesn't exist)
SELECT ge.id, ge.paid_by_member_id, ge.description, ge.amount
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.paid_by_member_id IS NOT NULL AND m.id IS NULL;

-- 3. Orphaned tournament format references in general expenses
SELECT ge.id, ge.tournament_format_id, ge.description
FROM general_expenses ge
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
WHERE ge.tournament_format_id IS NOT NULL AND tf.id IS NULL;

-- 4. Orphaned tournament format references in member dues
SELECT md.id, md.member_id, md.tournament_format_ids
FROM member_dues md
WHERE md.tournament_format_ids IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM tournament_formats tf 
    WHERE tf.id = ANY(md.tournament_format_ids)
  );

-- 5. Duplicate member emails
SELECT email, COUNT(*) as count
FROM members 
GROUP BY email
HAVING COUNT(*) > 1;

-- 6. Duplicate user emails
SELECT email, COUNT(*) as count
FROM users 
GROUP BY email
HAVING COUNT(*) > 1;

-- 7. Members without team assignment
SELECT m.id, m.first_name, m.last_name, m.email
FROM members m
WHERE m.team_id IS NULL;

-- 8. Users without role assignment
SELECT email, name, created_at
FROM users 
WHERE role IS NULL;

-- 9. Invalid email formats
SELECT id, first_name, last_name, email
FROM members 
WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- 10. Invalid phone number formats
SELECT id, first_name, last_name, phone
FROM members 
WHERE phone IS NOT NULL 
  AND phone !~ '^[0-9\-\+\(\)\s]+$';

-- 11. Negative amounts in expenses
SELECT id, description, amount, expense_date
FROM general_expenses 
WHERE amount < 0;

-- 12. Negative amounts in member dues
SELECT id, member_id, total_dues, due_date
FROM member_dues 
WHERE total_dues < 0;

-- 13. Future expense dates
SELECT id, description, amount, expense_date
FROM general_expenses 
WHERE expense_date > CURRENT_DATE;

-- 14. Future due dates
SELECT id, member_id, total_dues, due_date
FROM member_dues 
WHERE due_date > CURRENT_DATE + INTERVAL '1 year';

-- 15. Missing required fields in members
SELECT id, first_name, last_name, email
FROM members 
WHERE first_name IS NULL 
   OR last_name IS NULL 
   OR email IS NULL;

-- 16. Missing required fields in general expenses
SELECT id, description, amount, expense_date
FROM general_expenses 
WHERE description IS NULL 
   OR amount IS NULL 
   OR expense_date IS NULL;

-- 17. Missing required fields in member dues
SELECT id, member_id, total_dues, due_date
FROM member_dues 
WHERE member_id IS NULL 
   OR total_dues IS NULL 
   OR due_date IS NULL;

-- 18. Inconsistent year data
SELECT 'general_expenses' as table_name, year, COUNT(*) as count
FROM general_expenses 
GROUP BY year
UNION ALL
SELECT 'member_dues' as table_name, year, COUNT(*) as count
FROM member_dues 
GROUP BY year
UNION ALL
SELECT 'seasons' as table_name, year, COUNT(*) as count
FROM seasons 
GROUP BY year
ORDER BY table_name, year;

-- 19. Orphaned team references
SELECT m.id, m.first_name, m.last_name, m.team_id
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.team_id IS NOT NULL AND t.id IS NULL;

-- 20. Invalid tournament format IDs in member dues
SELECT md.id, md.member_id, md.tournament_format_ids
FROM member_dues md
WHERE md.tournament_format_ids IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM unnest(md.tournament_format_ids) as format_id
    WHERE format_id NOT IN (SELECT id FROM tournament_formats)
  );

-- 21. Data consistency checks
-- Check if member dues total matches calculated total
SELECT md.id, md.member_id, 
       md.season_dues, md.extra_jersey_dues, md.extra_trouser_dues, md.credit_adjustment,
       md.total_dues as stored_total,
       (md.season_dues + md.extra_jersey_dues + md.extra_trouser_dues + md.credit_adjustment) as calculated_total
FROM member_dues md
WHERE md.total_dues != (md.season_dues + md.extra_jersey_dues + md.extra_trouser_dues + md.credit_adjustment);

-- 22. Check for circular references
-- This would be more complex and depends on your specific business rules
-- Example: Check if a member is trying to pay dues for themselves in general expenses
SELECT ge.id, ge.description, ge.amount, ge.paid_by_member_id
FROM general_expenses ge
WHERE ge.paid_by_member_id IS NOT NULL 
  AND ge.description ILIKE '%dues%'
  AND ge.paid_by_member_id IN (
    SELECT member_id FROM member_dues 
    WHERE payment_status = 'Pending'
  );

-- 23. Check for data integrity in seasons
SELECT s.id, s.year, s.name, s.status,
       COUNT(tf.id) as format_count
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
GROUP BY s.id, s.year, s.name, s.status
HAVING COUNT(tf.id) = 0;

-- 24. Check for missing last_updated_by fields
SELECT 'general_expenses' as table_name, id, description, last_updated_by
FROM general_expenses 
WHERE last_updated_by IS NULL
UNION ALL
SELECT 'member_dues' as table_name, id, member_id::text, last_updated_by
FROM member_dues 
WHERE last_updated_by IS NULL
UNION ALL
SELECT 'seasons' as table_name, id, name, last_updated_by
FROM seasons 
WHERE last_updated_by IS NULL;

-- 25. Check for invalid status values
SELECT 'general_expenses' as table_name, settlement_status as status_value, COUNT(*) as count
FROM general_expenses 
WHERE settlement_status NOT IN ('Pending', 'Settled')
GROUP BY settlement_status
UNION ALL
SELECT 'member_dues' as table_name, payment_status as status_value, COUNT(*) as count
FROM member_dues 
WHERE payment_status NOT IN ('Pending', 'Paid')
GROUP BY payment_status
UNION ALL
SELECT 'seasons' as table_name, status as status_value, COUNT(*) as count
FROM seasons 
WHERE status NOT IN ('Active', 'Inactive')
GROUP BY status;

-- 26. Check for duplicate entries
SELECT 'general_expenses' as table_name, 
       description, amount, expense_date, paid_by_member_id,
       COUNT(*) as duplicate_count
FROM general_expenses 
GROUP BY description, amount, expense_date, paid_by_member_id
HAVING COUNT(*) > 1
UNION ALL
SELECT 'member_dues' as table_name,
       member_id::text, total_dues::text, due_date::text, year::text,
       COUNT(*) as duplicate_count
FROM member_dues 
GROUP BY member_id, total_dues, due_date, year
HAVING COUNT(*) > 1;

-- 27. Check for orphaned seasons
SELECT s.id, s.year, s.name
FROM seasons s
LEFT JOIN tournament_formats tf ON s.id = tf.season_id
LEFT JOIN member_dues md ON s.year = md.year
LEFT JOIN general_expenses ge ON s.year = ge.year
WHERE tf.id IS NULL AND md.id IS NULL AND ge.id IS NULL;

-- 28. Check for data age (old records that might need cleanup)
SELECT 'general_expenses' as table_name, 
       COUNT(*) as old_records
FROM general_expenses 
WHERE expense_date < CURRENT_DATE - INTERVAL '5 years'
UNION ALL
SELECT 'member_dues' as table_name,
       COUNT(*) as old_records
FROM member_dues 
WHERE due_date < CURRENT_DATE - INTERVAL '5 years';

-- 29. Check for missing audit trail
SELECT 'general_expenses' as table_name, id, description, created_at, last_updated_by
FROM general_expenses 
WHERE created_at IS NULL OR last_updated_by IS NULL
UNION ALL
SELECT 'member_dues' as table_name, id, member_id::text, created_at, last_updated_by
FROM member_dues 
WHERE created_at IS NULL OR last_updated_by IS NULL;

-- 30. Overall data health summary
SELECT 
    'Total Members' as metric, COUNT(*) as count
FROM members
UNION ALL
SELECT 
    'Members with Teams' as metric, COUNT(*) as count
FROM members WHERE team_id IS NOT NULL
UNION ALL
SELECT 
    'Total Users' as metric, COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Users with Roles' as metric, COUNT(*) as count
FROM users WHERE role IS NOT NULL
UNION ALL
SELECT 
    'Total General Expenses' as metric, COUNT(*) as count
FROM general_expenses
UNION ALL
SELECT 
    'Total Member Dues' as metric, COUNT(*) as count
FROM member_dues
UNION ALL
SELECT 
    'Total Seasons' as metric, COUNT(*) as count
FROM seasons
UNION ALL
SELECT 
    'Total Tournament Formats' as metric, COUNT(*) as count
FROM tournament_formats;
