require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuthQuery() {
  console.log('🧪 Testing Authentication Query')
  console.log('================================')
  
  try {
    // Test the exact query that auth.ts uses
    console.log('Testing the exact query from auth.ts...')
    const { data: userData, error } = await supabase
      .from('users')
      .select('role, name, google_id')
      .eq('email', 'srinii2005@gmail.com')
      .limit(1)
    
    console.log('Query result:')
    console.log('  Data:', userData)
    console.log('  Error:', error)
    console.log('  Data length:', userData ? userData.length : 'null')
    
    if (error) {
      console.log('❌ Query failed with error:', error.message)
      console.log('   Error code:', error.code)
      console.log('   Error details:', error.details)
    } else if (!userData || userData.length === 0) {
      console.log('❌ No data returned (empty array)')
    } else {
      console.log('✅ Query successful!')
      console.log('   User found:', userData[0])
    }
    
    // Test with different approaches
    console.log('\n🔍 Testing different query approaches...')
    
    // Approach 1: Select all columns
    console.log('\n1️⃣ Select all columns:')
    const { data: allData, error: allError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'srinii2005@gmail.com')
    
    console.log('   All data:', allData)
    console.log('   All error:', allError)
    
    // Approach 2: Just select role
    console.log('\n2️⃣ Select just role:')
    const { data: roleData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('email', 'srinii2005@gmail.com')
    
    console.log('   Role data:', roleData)
    console.log('   Role error:', roleError)
    
    // Approach 3: Check if RLS is the issue
    console.log('\n3️⃣ Testing RLS impact:')
    const { data: rlsData, error: rlsError } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'srinii2005@gmail.com')
    
    console.log('   RLS test data:', rlsData)
    console.log('   RLS test error:', rlsError)
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

testAuthQuery()
