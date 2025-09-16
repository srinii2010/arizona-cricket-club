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

async function testExistingTables() {
  console.log('Testing existing tables...');
  
  try {
    // Test members table (we know this exists)
    console.log('1. Testing members table...');
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .limit(1);

    if (membersError) {
      console.log('❌ Members table error:', membersError.message);
    } else {
      console.log('✅ Members table working, found', membersData.length, 'members');
    }

    // Test teams table
    console.log('2. Testing teams table...');
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(1);

    if (teamsError) {
      console.log('❌ Teams table error:', teamsError.message);
    } else {
      console.log('✅ Teams table working, found', teamsData.length, 'teams');
    }

    // Test users table
    console.log('3. Testing users table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table working, found', usersData.length, 'users');
    }

  } catch (error) {
    console.error('Error testing tables:', error);
  }
}

async function testNewTables() {
  console.log('\nTesting new tables (should fail if not created)...');
  
  try {
    // Test seasons table
    console.log('1. Testing seasons table...');
    const { data: seasonsData, error: seasonsError } = await supabase
      .from('seasons')
      .select('id, year, name')
      .limit(1);

    if (seasonsError) {
      console.log('❌ Seasons table does not exist:', seasonsError.message);
    } else {
      console.log('✅ Seasons table exists, found', seasonsData.length, 'seasons');
    }

    // Test tournament_formats table
    console.log('2. Testing tournament_formats table...');
    const { data: formatsData, error: formatsError } = await supabase
      .from('tournament_formats')
      .select('id, name')
      .limit(1);

    if (formatsError) {
      console.log('❌ Tournament formats table does not exist:', formatsError.message);
    } else {
      console.log('✅ Tournament formats table exists, found', formatsData.length, 'formats');
    }

    // Test member_dues table
    console.log('3. Testing member_dues table...');
    const { data: duesData, error: duesError } = await supabase
      .from('member_dues')
      .select('id, year, total_dues')
      .limit(1);

    if (duesError) {
      console.log('❌ Member dues table does not exist:', duesError.message);
    } else {
      console.log('✅ Member dues table exists, found', duesData.length, 'dues entries');
    }

    // Test general_expenses table
    console.log('4. Testing general_expenses table...');
    const { data: expensesData, error: expensesError } = await supabase
      .from('general_expenses')
      .select('id, category, amount')
      .limit(1);

    if (expensesError) {
      console.log('❌ General expenses table does not exist:', expensesError.message);
    } else {
      console.log('✅ General expenses table exists, found', expensesData.length, 'expenses');
    }

  } catch (error) {
    console.error('Error testing new tables:', error);
  }
}

async function main() {
  console.log('🔍 Testing Supabase connection and tables...\n');
  
  await testExistingTables();
  await testNewTables();
  
  console.log('\n📋 Summary:');
  console.log('If you see ❌ for the new tables, you need to create them.');
  console.log('Go to your Supabase dashboard → SQL Editor and run the SQL from create-expense-tables.sql');
  console.log('Then test the Season Management UI at: http://localhost:3000/admin/seasons');
}

main();
