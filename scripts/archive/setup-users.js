require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupUsers() {
  console.log('🔧 Setting up Email-based Authentication')
  console.log('========================================')
  
  try {
    // Step 1: Create the users table
    console.log('\n1️⃣ Creating users table...')
    const { data: createTable, error: createError } = await supabase
      .rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'admin',
            google_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    
    if (createError) {
      console.log('❌ Error creating table:', createError.message)
      console.log('   This might be because the table already exists or RLS is enabled')
    } else {
      console.log('✅ Users table created successfully')
    }
    
    // Step 2: Insert your user record
    console.log('\n2️⃣ Adding your user record...')
    const { data: insertUser, error: insertError } = await supabase
      .from('users')
      .upsert({
        email: 'srinii2005@gmail.com',
        name: 'S K',
        role: 'admin',
        google_id: '111504681471508856538'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting user:', insertError.message)
    } else {
      console.log('✅ User record added/updated successfully:')
      console.log(`   Email: ${insertUser[0].email}`)
      console.log(`   Name: ${insertUser[0].name}`)
      console.log(`   Role: ${insertUser[0].role}`)
      console.log(`   Google ID: ${insertUser[0].google_id}`)
    }
    
    // Step 3: Test the lookup
    console.log('\n3️⃣ Testing email lookup...')
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
    
    console.log('\n🎉 Setup complete!')
    console.log('Now try logging in again - it should work with email-based lookup!')
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

setupUsers()
