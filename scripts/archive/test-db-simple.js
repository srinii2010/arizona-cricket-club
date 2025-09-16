require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Database Connection')
  console.log('==============================')
  
  try {
    // Test 1: Check if we can query the users table at all
    console.log('\n1️⃣ Testing basic users table query...')
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('*')
    
    if (allError) {
      console.log('❌ Error querying users table:', allError.message)
      return
    } else {
      console.log('✅ Users table accessible')
      console.log('Records found:', allUsers.length)
      if (allUsers.length > 0) {
        console.log('Sample record:', allUsers[0])
        console.log('Available columns:', Object.keys(allUsers[0]))
      }
    }
    
    // Test 2: Check specific email lookup
    console.log('\n2️⃣ Testing email lookup...')
    const { data: emailUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'srinii2005@gmail.com')
    
    if (emailError) {
      console.log('❌ Error with email lookup:', emailError.message)
    } else {
      console.log('✅ Email lookup successful')
      console.log('Records found:', emailUser.length)
      if (emailUser.length > 0) {
        console.log('User record:', emailUser[0])
      }
    }
    
    // Test 3: Check if role column exists
    console.log('\n3️⃣ Testing role column...')
    const { data: roleTest, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('email', 'srinii2005@gmail.com')
    
    if (roleError) {
      console.log('❌ Role column error:', roleError.message)
      console.log('   This means the role column does not exist')
    } else {
      console.log('✅ Role column exists')
      console.log('Role data:', roleTest)
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

testDatabase()
