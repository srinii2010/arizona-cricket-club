-- Create a users table for email-based authentication
-- This will replace the user_roles table approach

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  google_id VARCHAR(255), -- Store Google user ID for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your user record
INSERT INTO users (email, name, role, google_id) 
VALUES ('srinii2005@gmail.com', 'S K', 'admin', '111504681471508856538')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  google_id = EXCLUDED.google_id,
  updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations for now
-- You can make this more restrictive later
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- Show the created user
SELECT * FROM users WHERE email = 'srinii2005@gmail.com';
