require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addMissingColumns() {
  console.log('🔧 Adding Missing Columns to Users Table')
  console.log('========================================')
  
  const columnsToAdd = [
    { name: 'role', type: 'VARCHAR(50) DEFAULT \'admin\'' },
    { name: 'google_id', type: 'VARCHAR(255)' },
    { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' },
    { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()' }
  ]
  
  try {
    for (const column of columnsToAdd) {
      console.log(`\n➕ Adding column: ${column.name}`)
      
      const { data, error } = await supabase
        .rpc('exec_sql', {
          query: `ALTER TABLE users ADD COLUMN ${column.name} ${column.type};`
        })
      
      if (error) {
        console.log(`   ❌ Error adding ${column.name}:`, error.message)
        // Check if column already exists
        if (error.message.includes('already exists')) {
          console.log(`   ✅ Column ${column.name} already exists`)
        }
      } else {
        console.log(`   ✅ Column ${column.name} added successfully`)
      }
    }
    
    // Now add the user record
    console.log('\n👤 Adding user record...')
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

addMissingColumns()
