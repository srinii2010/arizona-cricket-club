require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseClient() {
  console.log('\n🧪 Testing Supabase Client')
  console.log('==========================')
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .limit(1)
    
    if (error) {
      console.log('❌ Supabase client error:', error.message)
    } else {
      console.log('✅ Supabase client working')
      console.log('Data:', data)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}

testSupabaseClient()
