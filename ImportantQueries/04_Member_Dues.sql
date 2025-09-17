-- =====================================================
-- MEMBER DUES MANAGEMENT QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Get all member dues with member info
SELECT md.*, 
       m.first_name, m.last_name, m.email, m.phone
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
ORDER BY md.due_date DESC;

-- 2. Get member dues by year
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = 2024
ORDER BY md.due_date DESC;

-- 3. Get member dues by payment status
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
ORDER BY md.due_date DESC;

-- 4. Get member dues by specific member
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.member_id = 'member-id'
ORDER BY md.due_date DESC;

-- 5. Get dues for specific member by email
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE m.email = 'srinii2005@gmail.com'
ORDER BY md.due_date DESC;

-- 6. Add new member dues
INSERT INTO member_dues (member_id, year, tournament_format_ids, season_dues, extra_jersey_dues, extra_trouser_dues, credit_adjustment, total_dues, due_date, payment_status, comments, last_updated_by)
VALUES ('member-id', 2024, '["format1", "format2"]', 100.00, 25.00, 15.00, 0.00, 140.00, '2024-12-31', 'Pending', 'Season dues', 'srinii2005@gmail.com');

-- 7. Update member dues
UPDATE member_dues 
SET season_dues = 120.00, 
    total_dues = 160.00,
    last_updated_by = 'srinii2005@gmail.com'
WHERE id = 'dues-id';

-- 8. Settle member dues (mark as paid)
UPDATE member_dues 
SET payment_status = 'Paid', 
    settlement_date = CURRENT_DATE, 
    last_updated_by = 'srinii2005@gmail.com'
WHERE id = 'dues-id';

-- 9. Delete member dues
DELETE FROM member_dues 
WHERE id = 'dues-id';

-- 10. Get total member dues by year
SELECT year, 
       SUM(total_dues) as total_dues,
       SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as paid_dues,
       SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as pending_dues,
       COUNT(*) as dues_count
FROM member_dues 
GROUP BY year
ORDER BY year DESC;

-- 11. Get member dues by payment status for current year
SELECT payment_status, 
       SUM(total_dues) as total_amount,
       COUNT(*) as dues_count
FROM member_dues 
WHERE year = 2024
GROUP BY payment_status;

-- 12. Get pending dues
SELECT md.*, m.first_name, m.last_name, m.email
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
ORDER BY md.due_date;

-- 13. Get paid dues
SELECT md.*, m.first_name, m.last_name, m.email
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Paid'
ORDER BY md.settlement_date DESC;

-- 14. Get overdue dues (past due date and still pending)
SELECT md.*, m.first_name, m.last_name, m.email
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending' 
  AND md.due_date < CURRENT_DATE
ORDER BY md.due_date;

-- 15. Get dues by amount range
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.total_dues BETWEEN 100.00 AND 500.00
ORDER BY md.total_dues DESC;

-- 16. Get dues by date range
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.due_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY md.due_date DESC;

-- 17. Get top paying members
SELECT m.first_name, m.last_name, m.email,
       SUM(md.total_dues) as total_paid,
       COUNT(md.id) as dues_count
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Paid'
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_paid DESC
LIMIT 10;

-- 18. Get members with pending dues
SELECT m.first_name, m.last_name, m.email,
       SUM(md.total_dues) as total_pending,
       COUNT(md.id) as pending_count
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_pending DESC;

-- 19. Get monthly dues summary
SELECT EXTRACT(MONTH FROM due_date) as month,
       SUM(total_dues) as total_dues,
       SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as paid_dues,
       COUNT(*) as dues_count
FROM member_dues 
WHERE year = 2024
GROUP BY EXTRACT(MONTH FROM due_date)
ORDER BY month;

-- 20. Get recent dues
SELECT md.*, m.first_name, m.last_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
ORDER BY md.created_at DESC
LIMIT 10;
