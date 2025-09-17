-- =====================================================
-- GENERAL EXPENSES MANAGEMENT QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Get all general expenses with member and tournament format info
SELECT ge.*, 
       m.first_name, m.last_name, m.email, m.phone,
       tf.name as tournament_format_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
ORDER BY ge.expense_date DESC;

-- 2. Get expenses by year
SELECT ge.*, m.first_name, m.last_name, tf.name as tournament_format_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
WHERE ge.year = 2024
ORDER BY ge.expense_date DESC;

-- 3. Get expenses by category
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.category = 'Equipment'
ORDER BY ge.expense_date DESC;

-- 4. Get expenses by settlement status
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.settlement_status = 'Pending'
ORDER BY ge.expense_date DESC;

-- 5. Get expenses paid by specific member
SELECT ge.*, m.first_name, m.last_name, tf.name as tournament_format_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
WHERE ge.paid_by_member_id = 'member-id'
ORDER BY ge.expense_date DESC;

-- 6. Get expenses by tournament format
SELECT ge.*, m.first_name, m.last_name, tf.name as tournament_format_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
LEFT JOIN tournament_formats tf ON ge.tournament_format_id = tf.id
WHERE ge.tournament_format_id = 'format-id'
ORDER BY ge.expense_date DESC;

-- 7. Add new general expense
INSERT INTO general_expenses (year, tournament_format_id, category, description, amount, paid_by_member_id, settlement_status, settlement_date, comments, last_updated_by)
VALUES (2024, 'format-id', 'Equipment', 'Cricket balls', 150.00, 'member-id', 'Pending', NULL, 'Bought 6 cricket balls', 'srinii2005@gmail.com');

-- 8. Update general expense
UPDATE general_expenses 
SET category = 'Equipment', 
    amount = 200.00, 
    settlement_status = 'Settled',
    last_updated_by = 'srinii2005@gmail.com'
WHERE id = 'expense-id';

-- 9. Settle general expense
UPDATE general_expenses 
SET settlement_status = 'Settled', 
    settlement_date = CURRENT_DATE, 
    last_updated_by = 'srinii2005@gmail.com'
WHERE id = 'expense-id';

-- 10. Delete general expense
DELETE FROM general_expenses 
WHERE id = 'expense-id';

-- 11. Get total expenses by year
SELECT year, 
       SUM(amount) as total_amount,
       COUNT(*) as expense_count
FROM general_expenses 
GROUP BY year
ORDER BY year DESC;

-- 12. Get total expenses by category for current year
SELECT category, 
       SUM(amount) as total_amount,
       COUNT(*) as expense_count
FROM general_expenses 
WHERE year = 2024
GROUP BY category
ORDER BY total_amount DESC;

-- 13. Get pending expenses
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.settlement_status = 'Pending'
ORDER BY ge.expense_date;

-- 14. Get settled expenses
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.settlement_status = 'Settled'
ORDER BY ge.settlement_date DESC;

-- 15. Get expenses by amount range
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.amount BETWEEN 100.00 AND 500.00
ORDER BY ge.amount DESC;

-- 16. Get expenses by date range
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.expense_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY ge.expense_date DESC;

-- 17. Get top expense categories
SELECT category, 
       SUM(amount) as total_amount,
       COUNT(*) as expense_count,
       AVG(amount) as avg_amount
FROM general_expenses 
WHERE year = 2024
GROUP BY category
ORDER BY total_amount DESC;

-- 18. Get expenses by member (who paid)
SELECT m.first_name, m.last_name, m.email,
       SUM(ge.amount) as total_paid,
       COUNT(ge.id) as expense_count
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.year = 2024
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_paid DESC;

-- 19. Get monthly expense summary
SELECT EXTRACT(MONTH FROM expense_date) as month,
       SUM(amount) as total_amount,
       COUNT(*) as expense_count
FROM general_expenses 
WHERE year = 2024
GROUP BY EXTRACT(MONTH FROM expense_date)
ORDER BY month;

-- 20. Get recent expenses
SELECT ge.*, m.first_name, m.last_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
ORDER BY ge.created_at DESC
LIMIT 10;
