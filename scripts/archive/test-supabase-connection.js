require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  console.log('Make sure your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase Error:', error)
    } else {
      console.log('Supabase Connection Success!', data)
    }
  } catch (err) {
    console.error('Connection Error:', err)
  }
}

testConnection()