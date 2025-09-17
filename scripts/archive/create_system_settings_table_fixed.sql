-- Create system_settings table to control features
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (only if they don't exist)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('auto_export_enabled', 'true', 'Enable/disable automatic Excel exports at 11 PM'),
  ('export_cooldown_minutes', '5', 'Minimum minutes between exports to prevent spam'),
  ('last_export_time', '', 'Timestamp of last export to track cooldown')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Enable RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Service role can manage system_settings" ON system_settings;
DROP POLICY IF EXISTS "Authenticated users can read system_settings" ON system_settings;

-- Create new policies
CREATE POLICY "Service role can manage system_settings" ON system_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read system_settings" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');
