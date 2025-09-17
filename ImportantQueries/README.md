# 🏏 Arizona Cricket Club - Database Queries Reference

This folder contains organized SQL queries for managing the Arizona Cricket Club database. All queries use `srinii2005@gmail.com` as an example email address.

## 📁 File Structure

### 1. **01_Access_Management.sql**
- User role management queries
- Admin access verification
- User creation and updates
- Role assignment and removal

### 2. **02_Member_Management.sql**
- Member CRUD operations
- Team management
- Member search and filtering
- Member statistics

### 3. **03_General_Expenses.sql**
- Expense tracking and management
- Expense categorization
- Settlement status management
- Financial reporting

### 4. **04_Member_Dues.sql**
- Member dues management
- Payment status tracking
- Dues calculation and updates
- Payment analytics

### 5. **05_Seasons_Tournaments.sql**
- Season management
- Tournament format management
- Season-tournament relationships
- Tournament statistics

### 6. **06_Financial_Reports.sql**
- Comprehensive financial analytics
- Year-over-year comparisons
- Revenue and expense summaries
- Payment pattern analysis

### 7. **07_Data_Validation.sql**
- Data integrity checks
- Orphaned record detection
- Duplicate data identification
- Data consistency validation

### 8. **08_Quick_Reference.sql**
- Most commonly used queries
- Admin dashboard queries
- Search functionality
- Export queries
- One-liner utilities

## 🚀 Quick Start

### Most Common Queries

1. **Check user access:**
```sql
SELECT email, role, name FROM users WHERE email = 'srinii2005@gmail.com';
```

2. **Get all members:**
```sql
SELECT m.first_name, m.last_name, m.email, t.name as team_name
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
ORDER BY m.first_name;
```

3. **Current year expenses:**
```sql
SELECT description, amount, category, expense_date
FROM general_expenses 
WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY expense_date DESC;
```

4. **Pending dues:**
```sql
SELECT m.first_name, m.last_name, md.total_dues, md.due_date
FROM member_dues md
LEFT JOIN members m ON md.member_id = m.id
WHERE md.payment_status = 'Pending'
ORDER BY md.due_date;
```

## 📊 Database Schema Overview

### Core Tables
- **users** - System users and their roles
- **members** - Club members information
- **teams** - Team information
- **seasons** - Cricket seasons
- **tournament_formats** - Tournament types
- **general_expenses** - Club expenses
- **member_dues** - Member payment dues

### Key Relationships
- Members belong to Teams
- Expenses are paid by Members
- Dues are assigned to Members
- Tournaments belong to Seasons
- Expenses can be linked to Tournament Formats

## 🔧 Usage Tips

1. **Replace Example Email:** Change `srinii2005@gmail.com` to the actual email you want to query
2. **Update Date Ranges:** Modify year filters (e.g., `2024`) to match your needs
3. **Test Queries:** Always test queries in a development environment first
4. **Backup Data:** Create backups before running DELETE or UPDATE operations
5. **Index Performance:** Consider adding indexes on frequently queried columns

## 🛡️ Security Notes

- All queries use parameterized examples
- Replace hardcoded values with actual parameters
- Ensure proper access controls are in place
- Regular data validation is recommended

## 📈 Performance Considerations

- Use LIMIT clauses for large result sets
- Add appropriate indexes on frequently queried columns
- Consider pagination for large datasets
- Monitor query execution times

## 🔍 Troubleshooting

### Common Issues
1. **Orphaned Records:** Use validation queries to identify and fix
2. **Duplicate Data:** Check for duplicate emails or entries
3. **Missing References:** Verify foreign key relationships
4. **Data Inconsistencies:** Run consistency checks regularly

### Data Validation
Run the queries in `07_Data_Validation.sql` regularly to maintain data integrity.

## 📞 Support

For questions about these queries or database management:
- Check the individual SQL files for specific functionality
- Use the Quick Reference file for common operations
- Validate data regularly using the validation queries

---

**Last Updated:** September 2024  
**Database:** PostgreSQL (Supabase)  
**Example Email:** srinii2005@gmail.com
