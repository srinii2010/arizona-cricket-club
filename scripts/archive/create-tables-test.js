const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('Creating Expense Management and Season Management tables...\n');

  try {
    // 1. Create seasons table
    console.log('1. Creating seasons table...');
    const { data: seasonsTable, error: seasonsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS seasons (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          year INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (seasonsError) {
      console.error('Error creating seasons table:', seasonsError);
    } else {
      console.log('✅ Seasons table created successfully');
    }

    // 2. Create tournament_formats table
    console.log('2. Creating tournament_formats table...');
    const { data: formatsTable, error: formatsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tournament_formats (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (formatsError) {
      console.error('Error creating tournament_formats table:', formatsError);
    } else {
      console.log('✅ Tournament formats table created successfully');
    }

    // 3. Create member_dues table
    console.log('3. Creating member_dues table...');
    const { data: duesTable, error: duesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS member_dues (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          year INTEGER NOT NULL,
          tournament_format_ids UUID[] NOT NULL DEFAULT '{}',
          season_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
          extra_jersey_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
          extra_trouser_dues DECIMAL(10,2) NOT NULL DEFAULT 0,
          credit_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
          total_dues DECIMAL(10,2) GENERATED ALWAYS AS (season_dues + extra_jersey_dues + extra_trouser_dues + credit_adjustment) STORED,
          due_date DATE NOT NULL,
          payment_status VARCHAR(20) DEFAULT 'Not Paid' CHECK (payment_status IN ('Paid', 'Not Paid')),
          settlement_date DATE,
          comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (duesError) {
      console.error('Error creating member_dues table:', duesError);
    } else {
      console.log('✅ Member dues table created successfully');
    }

    // 4. Create general_expenses table
    console.log('4. Creating general_expenses table...');
    const { data: expensesTable, error: expensesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS general_expenses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          year INTEGER NOT NULL,
          tournament_format_id UUID REFERENCES tournament_formats(id) ON DELETE SET NULL,
          category VARCHAR(50) NOT NULL CHECK (category IN ('Umpire', 'Equipment', 'Storage', 'LiveStream', 'Mat', 'Food', 'Others')),
          description TEXT,
          amount DECIMAL(10,2) NOT NULL,
          paid_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
          settlement_status VARCHAR(20) DEFAULT 'Not Settled' CHECK (settlement_status IN ('Settled', 'Not Settled')),
          settlement_date DATE,
          comments TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (expensesError) {
      console.error('Error creating general_expenses table:', expensesError);
    } else {
      console.log('✅ General expenses table created successfully');
    }

    // 5. Create due_reminders table
    console.log('5. Creating due_reminders table...');
    const { data: remindersTable, error: remindersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS due_reminders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          member_dues_id UUID NOT NULL REFERENCES member_dues(id) ON DELETE CASCADE,
          reminder_date DATE NOT NULL,
          sent_at TIMESTAMP WITH TIME ZONE,
          status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Failed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (remindersError) {
      console.error('Error creating due_reminders table:', remindersError);
    } else {
      console.log('✅ Due reminders table created successfully');
    }

    // 6. Create indexes
    console.log('6. Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);',
      'CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);',
      'CREATE INDEX IF NOT EXISTS idx_tournament_formats_season_id ON tournament_formats(season_id);',
      'CREATE INDEX IF NOT EXISTS idx_member_dues_member_id ON member_dues(member_id);',
      'CREATE INDEX IF NOT EXISTS idx_member_dues_year ON member_dues(year);',
      'CREATE INDEX IF NOT EXISTS idx_member_dues_payment_status ON member_dues(payment_status);',
      'CREATE INDEX IF NOT EXISTS idx_general_expenses_year ON general_expenses(year);',
      'CREATE INDEX IF NOT EXISTS idx_general_expenses_category ON general_expenses(category);',
      'CREATE INDEX IF NOT EXISTS idx_general_expenses_paid_by_member_id ON general_expenses(paid_by_member_id);',
      'CREATE INDEX IF NOT EXISTS idx_due_reminders_member_dues_id ON due_reminders(member_dues_id);',
      'CREATE INDEX IF NOT EXISTS idx_due_reminders_status ON due_reminders(status);'
    ];

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSql });
      if (indexError) {
        console.error('Error creating index:', indexError);
      }
    }
    console.log('✅ Indexes created successfully');

    // 7. Create constraints
    console.log('7. Creating constraints...');
    const constraints = [
      'ALTER TABLE seasons ADD CONSTRAINT unique_season_year UNIQUE (year);',
      'ALTER TABLE tournament_formats ADD CONSTRAINT unique_format_per_season UNIQUE (season_id, name);',
      'ALTER TABLE member_dues ADD CONSTRAINT unique_member_year_formats UNIQUE (member_id, year, tournament_format_ids);'
    ];

    for (const constraintSql of constraints) {
      const { error: constraintError } = await supabase.rpc('exec_sql', { sql: constraintSql });
      if (constraintError) {
        console.error('Error creating constraint:', constraintError);
      }
    }
    console.log('✅ Constraints created successfully');

    // 8. Create trigger function and triggers
    console.log('8. Creating triggers...');
    const { error: triggerFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (triggerFunctionError) {
      console.error('Error creating trigger function:', triggerFunctionError);
    } else {
      console.log('✅ Trigger function created successfully');
    }

    const triggers = [
      'CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_tournament_formats_updated_at BEFORE UPDATE ON tournament_formats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_member_dues_updated_at BEFORE UPDATE ON member_dues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_general_expenses_updated_at BEFORE UPDATE ON general_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
    ];

    for (const triggerSql of triggers) {
      const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql });
      if (triggerError) {
        console.error('Error creating trigger:', triggerError);
      }
    }
    console.log('✅ Triggers created successfully');

    // 9. Insert sample data
    console.log('9. Inserting sample data...');
    const { error: sampleDataError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO seasons (year, name, status) VALUES 
        (2025, '2025 Season', 'Active'),
        (2024, '2024 Season', 'Inactive')
        ON CONFLICT (year) DO NOTHING;
      `
    });

    if (sampleDataError) {
      console.error('Error inserting sample seasons:', sampleDataError);
    } else {
      console.log('✅ Sample seasons inserted successfully');
    }

    // Insert sample tournament formats
    const { error: sampleFormatsError } = await supabase.rpc('exec_sql', {
      sql: `
        INSERT INTO tournament_formats (season_id, name, description) VALUES 
        ((SELECT id FROM seasons WHERE year = 2025), 'T20Platinum', 'T20 Platinum Division'),
        ((SELECT id FROM seasons WHERE year = 2025), 'T40DivA', 'T40 Division A'),
        ((SELECT id FROM seasons WHERE year = 2025), 'T40DivB', 'T40 Division B'),
        ((SELECT id FROM seasons WHERE year = 2024), 'T20Platinum', 'T20 Platinum Division 2024'),
        ((SELECT id FROM seasons WHERE year = 2024), 'T40DivA', 'T40 Division A 2024')
        ON CONFLICT (season_id, name) DO NOTHING;
      `
    });

    if (sampleFormatsError) {
      console.error('Error inserting sample tournament formats:', sampleFormatsError);
    } else {
      console.log('✅ Sample tournament formats inserted successfully');
    }

    console.log('\n🎉 All tables created successfully!');
    console.log('\nYou can now test the Season Management UI at: http://localhost:3000/admin/seasons');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the table creation
createTables();
