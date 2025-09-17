-- =====================================================
-- ACCESS MANAGEMENT QUERIES
-- Arizona Cricket Club Database
-- =====================================================

-- 1. Get all users with their roles
SELECT email, role, name 
FROM users 
ORDER BY email;

-- 2. Check if specific user has admin access
SELECT email, role, name 
FROM users 
WHERE email = 'srinii2005@gmail.com' 
AND role = 'admin';

-- 3. Check if user has any admin console access
SELECT email, role, name 
FROM users 
WHERE email = 'srinii2005@gmail.com' 
AND role IN ('admin', 'editor', 'viewer');

-- 4. Check if user exists in the system
SELECT email, role, name 
FROM users 
WHERE email = 'srinii2005@gmail.com';

-- 5. Add user with admin role
INSERT INTO users (email, role, name) 
VALUES ('srinii2005@gmail.com', 'admin', 'Srinivas');

-- 6. Add user with editor role
INSERT INTO users (email, role, name) 
VALUES ('srinii2005@gmail.com', 'editor', 'Srinivas');

-- 7. Add user with viewer role
INSERT INTO users (email, role, name) 
VALUES ('srinii2005@gmail.com', 'viewer', 'Srinivas');

-- 8. Update user role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'srinii2005@gmail.com';

-- 9. Update user role to editor
UPDATE users 
SET role = 'editor' 
WHERE email = 'srinii2005@gmail.com';

-- 10. Update user role to viewer
UPDATE users 
SET role = 'viewer' 
WHERE email = 'srinii2005@gmail.com';

-- 11. Remove user access (set role to null)
UPDATE users 
SET role = NULL 
WHERE email = 'srinii2005@gmail.com';

-- 12. Delete user completely
DELETE FROM users 
WHERE email = 'srinii2005@gmail.com';

-- 13. Get all admin users
SELECT email, role, name 
FROM users 
WHERE role = 'admin'
ORDER BY name;

-- 14. Get all editor users
SELECT email, role, name 
FROM users 
WHERE role = 'editor'
ORDER BY name;

-- 15. Get all viewer users
SELECT email, role, name 
FROM users 
WHERE role = 'viewer'
ORDER BY name;

-- 16. Count users by role
SELECT role, COUNT(*) as user_count
FROM users 
GROUP BY role
ORDER BY user_count DESC;
