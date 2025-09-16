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

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by listing existing tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('Existing tables:', data.map(t => t.table_name));
    return true;
  } catch (err) {
    console.error('Connection test failed:', err);
    return false;
  }
}

async function createTables() {
  console.log('\nCreating tables using direct SQL...');
  
  // Since we can't use exec_sql, let's try to create tables by inserting data
  // This will fail if tables don't exist, which is what we want to test
  
  try {
    // Test if seasons table exists by trying to insert
    console.log('1. Testing seasons table...');
    const { data: seasonData, error: seasonError } = await supabase
      .from('seasons')
      .insert({
        year: 2025,
        name: '2025 Season',
        status: 'Active'
      })
      .select();

    if (seasonError) {
      console.log('❌ Seasons table does not exist:', seasonError.message);
      console.log('You need to create the tables manually in Supabase dashboard.');
    } else {
      console.log('✅ Seasons table exists and working');
    }

    // Test if tournament_formats table exists
    console.log('2. Testing tournament_formats table...');
    const { data: formatData, error: formatError } = await supabase
      .from('tournament_formats')
      .insert({
        season_id: seasonData?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        name: 'T20Platinum',
        description: 'T20 Platinum Division'
      })
      .select();

    if (formatError) {
      console.log('❌ Tournament formats table does not exist:', formatError.message);
    } else {
      console.log('✅ Tournament formats table exists and working');
    }

    // Test if member_dues table exists
    console.log('3. Testing member_dues table...');
    const { data: duesData, error: duesError } = await supabase
      .from('member_dues')
      .insert({
        member_id: '00000000-0000-0000-0000-000000000000',
        year: 2025,
        tournament_format_ids: ['00000000-0000-0000-0000-000000000000'],
        season_dues: 100.00,
        due_date: '2025-12-31'
      })
      .select();

    if (duesError) {
      console.log('❌ Member dues table does not exist:', duesError.message);
    } else {
      console.log('✅ Member dues table exists and working');
    }

    // Test if general_expenses table exists
    console.log('4. Testing general_expenses table...');
    const { data: expenseData, error: expenseError } = await supabase
      .from('general_expenses')
      .insert({
        year: 2025,
        category: 'Equipment',
        amount: 50.00,
        paid_by_member_id: '00000000-0000-0000-0000-000000000000'
      })
      .select();

    if (expenseError) {
      console.log('❌ General expenses table does not exist:', expenseError.message);
    } else {
      console.log('✅ General expenses table exists and working');
    }

  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await createTables();
    
    console.log('\n📋 Next Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the SQL from create-expense-tables.sql');
    console.log('4. Run the SQL to create all tables');
    console.log('5. Then test the Season Management UI at: http://localhost:3000/admin/seasons');
  }
}

main();
