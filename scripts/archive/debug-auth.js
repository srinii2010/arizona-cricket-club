require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuth() {
  console.log('🔍 Debugging Authentication System')
  console.log('================================')
  
  const email = 'srinii2005@gmail.com'
  
  // Step 1: Check what's in your user_roles table
  console.log('\n1️⃣ Checking user_roles table...')
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Error querying user_roles:', error.message)
    } else {
      console.log('✅ Found user_roles records:', userRoles.length)
      userRoles.forEach((role, index) => {
        console.log(`   ${index + 1}. User ID: ${role.user_id}, Role: ${role.role}`)
      })
    }
  } catch (err) {
    console.log('❌ Exception querying user_roles:', err.message)
  }
  
  // Step 2: Try to get the auth.users data (this might fail due to RLS)
  console.log('\n2️⃣ Checking auth.users table...')
  try {
    const { data: authUsers, error } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
    
    if (error) {
      console.log('❌ Error querying auth.users:', error.message)
      console.log('   This is expected due to RLS policies')
    } else {
      console.log('✅ Found auth.users records:', authUsers.length)
      authUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}`)
      })
    }
  } catch (err) {
    console.log('❌ Exception querying auth.users:', err.message)
  }
  
  // Step 3: Test the exact query that auth.ts uses
  console.log('\n3️⃣ Testing auth.ts query...')
  console.log('   This simulates what happens when you log in')
  
  // We need to test with a real Google user ID
  // Let's try to find it from your user_roles table
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) {
      console.log('❌ Error getting user_roles:', error.message)
    } else if (userRoles.length > 0) {
      const testUserId = userRoles[0].user_id
      console.log(`   Testing with user_id: ${testUserId}`)
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', testUserId)
        .single()
      
      if (roleError) {
        console.log('❌ Error getting role:', roleError.message)
      } else {
        console.log('✅ Role query successful:', roleData.role)
      }
    }
  } catch (err) {
    console.log('❌ Exception testing auth query:', err.message)
  }
  
  // Step 4: Check if there are any RLS policies blocking access
  console.log('\n4️⃣ Checking RLS policies...')
  console.log('   If you see "infinite recursion" errors, there are RLS policy issues')
  
  // Step 5: Manual test - what Google user ID should we expect?
  console.log('\n5️⃣ Expected Google User ID format...')
  console.log('   Google user IDs typically look like: 123456789012345678901')
  console.log('   They are usually 21 digits long')
  console.log('   Your user_id in the database should match this format')
  
  console.log('\n🔧 Next Steps:')
  console.log('1. Check the browser console when you log in')
  console.log('2. Look for "Looking for user ID: [ID] Email: srinii2005@gmail.com"')
  console.log('3. Compare that ID with the user_id in your database')
  console.log('4. If they don\'t match, we need to update the database')
}

debugAuth()
