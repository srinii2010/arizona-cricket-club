-- =====================================================
-- FINANCIAL REPORTS & ANALYTICS QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Total expenses by year
SELECT year, 
       SUM(amount) as total_amount,
       COUNT(*) as expense_count,
       AVG(amount) as avg_amount
FROM general_expenses 
GROUP BY year
ORDER BY year DESC;

-- 2. Total member dues by year
SELECT year, 
       SUM(total_dues) as total_dues,
       SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as paid_dues,
       SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as pending_dues,
       COUNT(*) as dues_count
FROM member_dues 
GROUP BY year
ORDER BY year DESC;

-- 3. Combined financial summary by year
SELECT 
    COALESCE(ge.year, md.year) as year,
    COALESCE(ge.total_expenses, 0) as total_expenses,
    COALESCE(md.total_dues, 0) as total_dues,
    COALESCE(md.paid_dues, 0) as paid_dues,
    COALESCE(md.pending_dues, 0) as pending_dues,
    (COALESCE(md.paid_dues, 0) - COALESCE(ge.total_expenses, 0)) as net_balance
FROM (
    SELECT year, SUM(amount) as total_expenses
    FROM general_expenses 
    GROUP BY year
) ge
FULL OUTER JOIN (
    SELECT year, 
           SUM(total_dues) as total_dues,
           SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as paid_dues,
           SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as pending_dues
    FROM member_dues 
    GROUP BY year
) md ON ge.year = md.year
ORDER BY year DESC;

-- 4. Expenses by category for current year
SELECT category, 
       SUM(amount) as total_amount,
       COUNT(*) as expense_count,
       AVG(amount) as avg_amount,
       ROUND((SUM(amount) * 100.0 / SUM(SUM(amount)) OVER()), 2) as percentage
FROM general_expenses 
WHERE year = 2024
GROUP BY category
ORDER BY total_amount DESC;

-- 5. Member dues by payment status for current year
SELECT payment_status, 
       SUM(total_dues) as total_amount,
       COUNT(*) as dues_count,
       AVG(total_dues) as avg_amount
FROM member_dues 
WHERE year = 2024
GROUP BY payment_status
ORDER BY total_amount DESC;

-- 6. Top paying members
SELECT m.first_name, m.last_name, m.email,
       SUM(md.total_dues) as total_paid,
       COUNT(md.id) as dues_count,
       AVG(md.total_dues) as avg_dues
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Paid'
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_paid DESC
LIMIT 10;

-- 7. Members with pending dues
SELECT m.first_name, m.last_name, m.email,
       SUM(md.total_dues) as total_pending,
       COUNT(md.id) as pending_count,
       MIN(md.due_date) as earliest_due_date
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_pending DESC;

-- 8. Monthly expense summary
SELECT 
    EXTRACT(MONTH FROM expense_date) as month,
    EXTRACT(YEAR FROM expense_date) as year,
    SUM(amount) as total_amount,
    COUNT(*) as expense_count,
    AVG(amount) as avg_amount
FROM general_expenses 
WHERE EXTRACT(YEAR FROM expense_date) = 2024
GROUP BY EXTRACT(MONTH FROM expense_date), EXTRACT(YEAR FROM expense_date)
ORDER BY month;

-- 9. Monthly member dues summary
SELECT 
    EXTRACT(MONTH FROM due_date) as month,
    EXTRACT(YEAR FROM due_date) as year,
    SUM(total_dues) as total_dues,
    SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as paid_dues,
    SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as pending_dues,
    COUNT(*) as dues_count
FROM member_dues 
WHERE EXTRACT(YEAR FROM due_date) = 2024
GROUP BY EXTRACT(MONTH FROM due_date), EXTRACT(YEAR FROM due_date)
ORDER BY month;

-- 10. Expenses by member (who paid)
SELECT m.first_name, m.last_name, m.email,
       SUM(ge.amount) as total_paid,
       COUNT(ge.id) as expense_count,
       AVG(ge.amount) as avg_expense
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.year = 2024
GROUP BY m.id, m.first_name, m.last_name, m.email
ORDER BY total_paid DESC;

-- 11. Overdue dues report
SELECT m.first_name, m.last_name, m.email, m.phone,
       md.total_dues, md.due_date,
       (CURRENT_DATE - md.due_date) as days_overdue
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending' 
  AND md.due_date < CURRENT_DATE
ORDER BY days_overdue DESC;

-- 12. Settlement status summary
SELECT 
    'General Expenses' as type,
    settlement_status as status,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM general_expenses 
WHERE year = 2024
GROUP BY settlement_status
UNION ALL
SELECT 
    'Member Dues' as type,
    payment_status as status,
    COUNT(*) as count,
    SUM(total_dues) as total_amount
FROM member_dues 
WHERE year = 2024
GROUP BY payment_status
ORDER BY type, status;

-- 13. Tournament format financial impact
SELECT tf.name as tournament_format,
       s.year as season_year,
       COUNT(DISTINCT md.id) as member_dues_count,
       SUM(md.total_dues) as total_dues,
       COUNT(DISTINCT ge.id) as general_expenses_count,
       SUM(ge.amount) as total_expenses
FROM tournament_formats tf
LEFT JOIN seasons s ON tf.season_id = s.id
LEFT JOIN member_dues md ON tf.id = ANY(md.tournament_format_ids)
LEFT JOIN general_expenses ge ON tf.id = ge.tournament_format_id
WHERE s.year = 2024
GROUP BY tf.id, tf.name, s.year
ORDER BY total_dues DESC;

-- 14. Team financial summary
SELECT t.name as team_name,
       COUNT(DISTINCT m.id) as member_count,
       SUM(md.total_dues) as total_dues,
       SUM(CASE WHEN md.payment_status = 'Paid' THEN md.total_dues ELSE 0 END) as paid_dues,
       SUM(CASE WHEN md.payment_status = 'Pending' THEN md.total_dues ELSE 0 END) as pending_dues
FROM teams t
LEFT JOIN members m ON t.id = m.team_id
LEFT JOIN member_dues md ON m.id = md.member_id
WHERE md.year = 2024
GROUP BY t.id, t.name
ORDER BY total_dues DESC;

-- 15. Year-over-year comparison
SELECT 
    year,
    SUM(amount) as total_expenses,
    LAG(SUM(amount)) OVER (ORDER BY year) as previous_year_expenses,
    ROUND(((SUM(amount) - LAG(SUM(amount)) OVER (ORDER BY year)) * 100.0 / LAG(SUM(amount)) OVER (ORDER BY year)), 2) as expense_growth_percent
FROM general_expenses 
GROUP BY year
ORDER BY year;

-- 16. Recent financial activity
SELECT 
    'General Expense' as type,
    ge.amount,
    ge.category,
    ge.expense_date as date,
    m.first_name || ' ' || m.last_name as member_name
FROM general_expenses ge
LEFT JOIN members m ON ge.paid_by_member_id = m.id
WHERE ge.year = 2024
UNION ALL
SELECT 
    'Member Dues' as type,
    md.total_dues as amount,
    md.payment_status as category,
    md.due_date as date,
    m.first_name || ' ' || m.last_name as member_name
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = 2024
ORDER BY date DESC
LIMIT 20;

-- 17. Financial health indicators
SELECT 
    'Total Revenue (Paid Dues)' as metric,
    SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = 2024
UNION ALL
SELECT 
    'Total Expenses' as metric,
    SUM(amount) as amount
FROM general_expenses 
WHERE year = 2024
UNION ALL
SELECT 
    'Pending Revenue' as metric,
    SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = 2024;

-- 18. Quarterly financial summary
SELECT 
    EXTRACT(QUARTER FROM expense_date) as quarter,
    EXTRACT(YEAR FROM expense_date) as year,
    SUM(amount) as total_expenses,
    COUNT(*) as expense_count
FROM general_expenses 
WHERE EXTRACT(YEAR FROM expense_date) = 2024
GROUP BY EXTRACT(QUARTER FROM expense_date), EXTRACT(YEAR FROM expense_date)
ORDER BY quarter;

-- 19. Member payment patterns
SELECT m.first_name, m.last_name, m.email,
       COUNT(md.id) as total_dues,
       SUM(CASE WHEN md.payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
       ROUND((SUM(CASE WHEN md.payment_status = 'Paid' THEN 1 ELSE 0 END) * 100.0 / COUNT(md.id)), 2) as payment_rate
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.year = 2024
GROUP BY m.id, m.first_name, m.last_name, m.email
HAVING COUNT(md.id) > 0
ORDER BY payment_rate DESC;

-- 20. Financial dashboard summary
SELECT 
    'Current Year Revenue' as metric,
    SUM(CASE WHEN payment_status = 'Paid' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 
    'Current Year Expenses' as metric,
    SUM(amount) as amount
FROM general_expenses 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 
    'Outstanding Dues' as metric,
    SUM(CASE WHEN payment_status = 'Pending' THEN total_dues ELSE 0 END) as amount
FROM member_dues 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 
    'Active Members' as metric,
    COUNT(DISTINCT member_id) as amount
FROM member_dues 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE);
