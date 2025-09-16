require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  console.log('Testing authentication system...')
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')
  
  // Test 1: Check if we can query user_roles table
  console.log('\n=== Test 1: Query user_roles table ===')
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ Error querying user_roles:', error.message)
    } else {
      console.log('✅ Successfully queried user_roles table')
      console.log('Records found:', data.length)
      if (data.length > 0) {
        console.log('Sample record:', data[0])
      }
    }
  } catch (err) {
    console.log('❌ Exception querying user_roles:', err.message)
  }
  
  // Test 2: Check if we can query auth.users table
  console.log('\n=== Test 2: Query auth.users table ===')
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5)
    
    if (error) {
      console.log('❌ Error querying auth.users:', error.message)
    } else {
      console.log('✅ Successfully queried auth.users table')
      console.log('Records found:', data.length)
      if (data.length > 0) {
        console.log('Sample record:', data[0])
      }
    }
  } catch (err) {
    console.log('❌ Exception querying auth.users:', err.message)
  }
  
  // Test 3: Test the specific query that auth.ts uses
  console.log('\n=== Test 3: Test auth query ===')
  try {
    const testEmail = 'srinii2005@gmail.com'
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role,
        users:user_id(email)
      `)
      .eq('users.email', testEmail)
      .single()
    
    if (error) {
      console.log('❌ Error with auth query:', error.message)
    } else {
      console.log('✅ Auth query successful')
      console.log('Data:', data)
    }
  } catch (err) {
    console.log('❌ Exception with auth query:', err.message)
  }
  
  // Test 4: Try a simpler approach
  console.log('\n=== Test 4: Simple approach ===')
  try {
    const testEmail = 'srinii2005@gmail.com'
    
    // First get user_id from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', testEmail)
      .single()
    
    if (authError) {
      console.log('❌ Error getting user from auth.users:', authError.message)
    } else {
      console.log('✅ Found user in auth.users:', authUser.id)
      
      // Then get role from user_roles
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single()
      
      if (roleError) {
        console.log('❌ Error getting role from user_roles:', roleError.message)
      } else {
        console.log('✅ Found user role:', userRole.role)
      }
    }
  } catch (err) {
    console.log('❌ Exception with simple approach:', err.message)
  }
}

testAuth()
