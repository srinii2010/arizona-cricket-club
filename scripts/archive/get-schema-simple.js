require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSchemaSimple() {
  console.log('🔍 Getting Database Schema (Simple Approach)')
  console.log('============================================')
  
  const tables = ['teams', 'members', 'expenses', 'users', 'user_roles']
  
  for (const tableName of tables) {
    console.log(`\n📋 Table: ${tableName}`)
    console.log('='.repeat(30))
    
    try {
      // Try to get all data to see the structure
      const { data: allData, error: allError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (allError) {
        console.log(`❌ Error: ${allError.message}`)
        continue
      }
      
      if (allData.length === 0) {
        console.log('📝 Table is empty, but exists')
        
        // Try to insert a test record to see the structure
        console.log('🧪 Trying to insert test record to see structure...')
        
        let testData = {}
        if (tableName === 'teams') {
          testData = { name: 'Test Team', description: 'Test Description' }
        } else if (tableName === 'members') {
          testData = { 
            first_name: 'Test', 
            last_name: 'Member', 
            email: 'test@example.com',
            phone: '555-0123',
            team_id: '00000000-0000-0000-0000-000000000000'
          }
        } else if (tableName === 'expenses') {
          testData = { 
            amount: 100.00, 
            description: 'Test Expense',
            category: 'test'
          }
        }
        
        if (Object.keys(testData).length > 0) {
          const { data: insertData, error: insertError } = await supabase
            .from(tableName)
            .insert([testData])
            .select()
          
          if (insertError) {
            console.log(`❌ Insert error: ${insertError.message}`)
            console.log('   This tells us about the expected columns')
          } else {
            console.log('✅ Test record inserted successfully')
            console.log('📊 Structure from insert:', insertData[0])
            
            // Clean up test record
            await supabase
              .from(tableName)
              .delete()
              .eq('id', insertData[0].id)
          }
        }
      } else {
        console.log('✅ Table has data')
        console.log('📊 Sample record structure:')
        const record = allData[0]
        Object.keys(record).forEach(key => {
          const value = record[key]
          const type = typeof value
          console.log(`   ${key}: ${type} (${value})`)
        })
      }
      
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`)
    }
  }
  
  // Try to get some specific information about the tables
  console.log('\n🔍 Additional Information')
  console.log('========================')
  
  // Check if we can get table info from pg_tables
  try {
    const { data: pgTables, error: pgError } = await supabase
      .from('pg_tables')
      .select('tablename, schemaname')
      .eq('schemaname', 'public')
    
    if (pgError) {
      console.log('❌ Could not access pg_tables:', pgError.message)
    } else {
      console.log('✅ Available tables:', pgTables)
    }
  } catch (err) {
    console.log('❌ Exception accessing pg_tables:', err.message)
  }
}

getSchemaSimple()
