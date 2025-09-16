require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserID() {
  console.log('🔍 Checking User ID in Database')
  console.log('================================')
  
  try {
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Error:', error.message)
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
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

checkUserID()
