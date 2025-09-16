require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addUserRecord() {
  console.log('👤 Adding User Record to Database')
  console.log('==================================')
  
  try {
    // Add the user record
    console.log('Adding user record...')
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
    
    console.log('\n🎉 Setup complete!')
    console.log('Now try logging in again - it should work!')
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

addUserRecord()
