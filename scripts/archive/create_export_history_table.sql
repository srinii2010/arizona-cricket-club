-- Create export_history table to track daily exports
CREATE TABLE IF NOT EXISTS export_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  export_date DATE NOT NULL,
  export_type VARCHAR(20) NOT NULL CHECK (export_type IN ('daily', 'data_change')),
  has_changes BOOLEAN NOT NULL DEFAULT false,
  records_exported INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_export_history_date_type ON export_history(export_date, export_type);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage export history
CREATE POLICY "Service role can manage export_history" ON export_history
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read export history
CREATE POLICY "Authenticated users can read export_history" ON export_history
  FOR SELECT USING (auth.role() = 'authenticated');
