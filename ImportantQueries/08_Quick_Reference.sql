-- =====================================================
-- QUICK REFERENCE QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- =====================================================
-- MOST COMMONLY USED QUERIES
-- =====================================================

-- 1. Check if user has admin access (use your email)
SELECT email, role, name 
FROM users 
WHERE email = 'srinii2005@gmail.com';

-- 2. Get all members with team info
SELECT m.first_name, m.last_name, m.email, m.phone, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
ORDER BY m.first_name;

-- 3. Get current year expenses
SELECT ge.description, ge.amount, ge.category, ge.expense_date,
       m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY ge.expense_date DESC;

-- 4. Get current year member dues
SELECT md.total_dues, md.payment_status, md.due_date,
       m.first_name, m.last_name, m.email
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY md.due_date DESC;

-- 5. Get pending dues
SELECT m.first_name, m.last_name, m.email, md.total_dues, md.due_date
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
ORDER BY md.due_date;

-- =====================================================
-- ADMIN DASHBOARD QUERIES
-- =====================================================

-- 6. Financial summary for current year
SELECT 
    'Revenue (Paid Dues)' as metric,
    SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 
    'Expenses' as metric,
    SUM(amount) as amount
FROM general_expenses 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 
    'Outstanding Dues' as metric,
    SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE);

-- 7. Member statistics
SELECT 
    'Total Members' as metric, COUNT(*) as count
FROM members
UNION ALL
SELECT 
    'Members with Teams' as metric, COUNT(*) as count
FROM members WHERE team_id IS NOT NULL
UNION ALL
SELECT 
    'Active Users' as metric, COUNT(*) as count
FROM users WHERE role IS NOT NULL;

-- 8. Recent activity
SELECT 'General Expense' as type, description, amount, expense_date
FROM general_expenses 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 'Member Dues' as type, 'Dues for ' || m.first_name || ' ' || m.last_name, total_dues, due_date
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY expense_date DESC, due_date DESC
LIMIT 10;

-- =====================================================
-- SEARCH QUERIES
-- =====================================================

-- 9. Search member by name
SELECT m.*, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
WHERE m.first_name ILIKE '%search_term%' 
   OR m.last_name ILIKE '%search_term%'
   OR m.email ILIKE '%search_term%';

-- 10. Search expenses by description
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.description ILIKE '%search_term%'
ORDER BY ge.expense_date DESC;

-- =====================================================
-- EXPORT QUERIES
-- =====================================================

-- 11. Export all members
SELECT m.first_name, m.last_name, m.email, m.phone, m.role, m.gender, m.date_of_birth,
       t.name as team_name, m.created_at
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
ORDER BY m.first_name, m.last_name;

-- 12. Export current year expenses
SELECT ge.description, ge.category, ge.amount, ge.expense_date, ge.settlement_status,
       m.first_name || ' ' || m.last_name as paid_by,
       tf.name as tournament_format
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
WHERE ge.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY ge.expense_date DESC;

-- 13. Export current year member dues
SELECT m.first_name, m.last_name, m.email, m.phone,
       md.season_dues, md.extra_jersey_dues, md.extra_trouser_dues, md.credit_adjustment,
       md.total_dues, md.payment_status, md.due_date, md.settlement_date
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY m.first_name, m.last_name;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- 14. Check for data issues
SELECT 'Orphaned Member Dues' as issue, COUNT(*) as count
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE m.id IS NULL
UNION ALL
SELECT 'Duplicate Member Emails' as issue, COUNT(*) as count
FROM (
    SELECT email FROM members GROUP BY email HAVING COUNT(*) > 1
) duplicates
UNION ALL
SELECT 'Negative Amounts' as issue, COUNT(*) as count
FROM general_expenses WHERE amount < 0
UNION ALL
SELECT 'Future Dates' as issue, COUNT(*) as count
FROM general_expenses WHERE expense_date > CURRENT_DATE;

-- 15. Clean up old data (be careful!)
-- DELETE FROM general_expenses WHERE expense_date < CURRENT_DATE - INTERVAL '5 years';
-- DELETE FROM member_dues WHERE due_date < CURRENT_DATE - INTERVAL '5 years';

-- =====================================================
-- BACKUP QUERIES
-- =====================================================

-- 16. Create backup of critical data
CREATE TABLE members_backup AS SELECT * FROM members;
CREATE TABLE users_backup AS SELECT * FROM users;
CREATE TABLE general_expenses_backup AS SELECT * FROM general_expenses;
CREATE TABLE member_dues_backup AS SELECT * FROM member_dues;

-- 17. Restore from backup (if needed)
-- INSERT INTO members SELECT * FROM members_backup;
-- INSERT INTO users SELECT * FROM users_backup;
-- INSERT INTO general_expenses SELECT * FROM general_expenses_backup;
-- INSERT INTO member_dues SELECT * FROM member_dues_backup;

-- =====================================================
-- USEFUL ONE-LINERS
-- =====================================================

-- 18. Quick member count by team
SELECT t.name, COUNT(m.id) FROM teams t LEFT JOIN members m ON t.id = m.team_id GROUP BY t.name;

-- 19. Quick expense total for current year
SELECT SUM(amount) FROM general_expenses WHERE year = EXTRACT(YEAR FROM CURRENT_DATE);

-- 20. Quick dues total for current year
SELECT SUM(total_dues) FROM member_dues WHERE year = EXTRACT(YEAR FROM CURRENT_DATE);

-- 21. Quick pending dues count
SELECT COUNT(*) FROM member_dues WHERE payment_status = 'Pending';

-- 22. Quick admin user count
SELECT COUNT(*) FROM users WHERE role = 'admin';

-- 23. Quick member count
SELECT COUNT(*) FROM members;

-- 24. Quick team count
SELECT COUNT(*) FROM teams;

-- 25. Quick season count
SELECT COUNT(*) FROM seasons;
