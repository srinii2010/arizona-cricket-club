require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('🔍 Checking Users Table Structure')
  console.log('==================================')
  
  try {
    // Try to get all columns by selecting *
    const { data: allData, error: allError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (allError) {
      console.log('❌ Error selecting all columns:', allError.message)
    } else {
      console.log('✅ Table structure (from sample data):')
      if (allData.length > 0) {
        console.log('Columns found:', Object.keys(allData[0]))
        console.log('Sample record:', allData[0])
      } else {
        console.log('Table is empty, but exists')
      }
    }
    
    // Try specific columns one by one
    const columnsToTest = ['id', 'email', 'name', 'role', 'google_id', 'created_at', 'updated_at']
    
    console.log('\n🧪 Testing individual columns:')
    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(column)
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${column}: ${error.message}`)
        } else {
          console.log(`   ✅ ${column}: exists`)
        }
      } catch (err) {
        console.log(`   ❌ ${column}: ${err.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

checkTableStructure()
