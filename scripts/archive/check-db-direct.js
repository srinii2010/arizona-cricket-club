require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Use service role key if available to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking Database Directly')
  console.log('============================')
  
  try {
    // Check user_roles table
    console.log('\n1️⃣ Checking user_roles table...')
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (rolesError) {
      console.log('❌ Error querying user_roles:', rolesError.message)
    } else {
      console.log('✅ Found user_roles records:', userRoles.length)
      userRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. ID: ${role.id}`)
        console.log(`      User ID: ${role.user_id}`)
        console.log(`      Role: ${role.role}`)
        console.log(`      Created: ${role.created_at}`)
        console.log('      ---')
      })
    }
    
    // Check if we can query auth.users (this might still fail)
    console.log('\n2️⃣ Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'srinii2005@gmail.com')
    
    if (authError) {
      console.log('❌ Error querying auth.users:', authError.message)
      console.log('   This is expected - auth.users is in a different schema')
    } else {
      console.log('✅ Found auth.users records:', authUsers.length)
      authUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}`)
      })
    }
    
    // Try to get the user ID from your SQL query
    console.log('\n3️⃣ Running your SQL query...')
    const { data: sqlResult, error: sqlError } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT ur.id, ur.user_id, ur.role, u.email
          FROM user_roles ur
          JOIN auth.users u ON ur.user_id = u.id
          WHERE u.email = 'srinii2005@gmail.com'
        `
      })
    
    if (sqlError) {
      console.log('❌ Error running SQL query:', sqlError.message)
    } else {
      console.log('✅ SQL query result:', sqlResult)
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
  
  console.log('\n🔧 To fix the RLS issue:')
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Go to Authentication > Policies')
  console.log('3. Find the user_roles table policies')
  console.log('4. Check for any policies that might cause infinite recursion')
  console.log('5. Or temporarily disable RLS on user_roles table for testing')
}

checkDatabase()
