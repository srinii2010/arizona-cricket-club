require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Use service role key if available, otherwise use anon key
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseKey)

async function addUserBypassRLS() {
  console.log('👤 Adding User Record (Bypassing RLS)')
  console.log('=====================================')
  
  if (!supabaseServiceKey) {
    console.log('⚠️  No service role key found. Using anon key (might fail due to RLS)')
  } else {
    console.log('✅ Using service role key to bypass RLS')
  }
  
  try {
    // Add the user record
    console.log('\nAdding user record...')
    const { data: insertUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'srinii2005@gmail.com',
        name: 'S K',
        role: 'admin',
        google_id: '111504681471508856538'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting user:', insertError.message)
      
      if (insertError.message.includes('row-level security')) {
        console.log('\n🔧 RLS is blocking the insert. You need to either:')
        console.log('1. Disable RLS on the users table in Supabase dashboard')
        console.log('2. Add a service role key to your .env.local file')
        console.log('3. Create a proper RLS policy')
        console.log('\nTo disable RLS:')
        console.log('1. Go to Supabase Dashboard → Authentication → Policies')
        console.log('2. Find the users table')
        console.log('3. Disable RLS temporarily')
      }
    } else {
      console.log('✅ User record added successfully:')
      console.log(`   ID: ${insertUser[0].id}`)
      console.log(`   Email: ${insertUser[0].email}`)
      console.log(`   Name: ${insertUser[0].name}`)
      console.log(`   Role: ${insertUser[0].role}`)
      console.log(`   Google ID: ${insertUser[0].google_id}`)
    }
    
    // Test the lookup
    console.log('\n🧪 Testing email lookup...')
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('role, name, google_id')
      .eq('email', 'srinii2005@gmail.com')
    
    if (testError) {
      console.log('❌ Error testing lookup:', testError.message)
    } else {
      console.log('✅ Email lookup test successful:')
      console.log(`   Records found: ${testUser.length}`)
      if (testUser.length > 0) {
        console.log(`   Role: ${testUser[0].role}`)
        console.log(`   Name: ${testUser[0].name}`)
        console.log(`   Google ID: ${testUser[0].google_id}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

addUserBypassRLS()
