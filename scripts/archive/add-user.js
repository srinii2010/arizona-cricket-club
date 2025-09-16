require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addUser() {
  console.log('👤 Adding User to Database')
  console.log('==========================')
  
  try {
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
      console.log('Make sure the users table exists in your Supabase dashboard')
    } else {
      console.log('✅ User record added successfully:')
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
      .single()
    
    if (testError) {
      console.log('❌ Error testing lookup:', testError.message)
    } else {
      console.log('✅ Email lookup test successful:')
      console.log(`   Role: ${testUser.role}`)
      console.log(`   Name: ${testUser.name}`)
      console.log(`   Google ID: ${testUser.google_id}`)
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

addUser()
