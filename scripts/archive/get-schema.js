require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSchema() {
  console.log('🔍 Getting Database Schema')
  console.log('==========================')
  
  try {
    // 1. Get all table names
    console.log('\n1️⃣ Getting all table names...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `
      })
    
    if (tablesError) {
      console.log('❌ Error getting tables:', tablesError.message)
      // Try alternative approach
      console.log('Trying alternative approach...')
      const { data: altTables, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name')
      
      if (altError) {
        console.log('❌ Alternative approach failed:', altError.message)
      } else {
        console.log('✅ Tables found:', altTables)
      }
    } else {
      console.log('✅ Tables found:', tables)
    }
    
    // 2. Get schema for each table
    const tableNames = ['teams', 'members', 'expenses', 'users', 'user_roles']
    
    for (const tableName of tableNames) {
      console.log(`\n2️⃣ Getting schema for ${tableName} table...`)
      
      try {
        const { data: schema, error: schemaError } = await supabase
          .rpc('exec_sql', {
            query: `
              SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
              FROM information_schema.columns 
              WHERE table_name = '${tableName}' 
              AND table_schema = 'public'
              ORDER BY ordinal_position
            `
          })
        
        if (schemaError) {
          console.log(`❌ Error getting schema for ${tableName}:`, schemaError.message)
          
          // Try alternative approach
          const { data: altSchema, error: altError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default, character_maximum_length')
            .eq('table_name', tableName)
            .eq('table_schema', 'public')
            .order('ordinal_position')
          
          if (altError) {
            console.log(`❌ Alternative approach failed for ${tableName}:`, altError.message)
          } else {
            console.log(`✅ Schema for ${tableName}:`, altSchema)
          }
        } else {
          console.log(`✅ Schema for ${tableName}:`, schema)
        }
      } catch (err) {
        console.log(`❌ Exception getting schema for ${tableName}:`, err.message)
      }
    }
    
    // 3. Get foreign key relationships
    console.log('\n3️⃣ Getting foreign key relationships...')
    try {
      const { data: fks, error: fkError } = await supabase
        .rpc('exec_sql', {
          query: `
            SELECT
              tc.table_name, 
              kcu.column_name, 
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name 
            FROM 
              information_schema.table_constraints AS tc 
              JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
              JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema='public'
          `
        })
      
      if (fkError) {
        console.log('❌ Error getting foreign keys:', fkError.message)
      } else {
        console.log('✅ Foreign keys:', fks)
      }
    } catch (err) {
      console.log('❌ Exception getting foreign keys:', err.message)
    }
    
    // 4. Try to get sample data from each table
    console.log('\n4️⃣ Getting sample data from each table...')
    for (const tableName of tableNames) {
      try {
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(3)
        
        if (sampleError) {
          console.log(`❌ Error getting sample data from ${tableName}:`, sampleError.message)
        } else {
          console.log(`✅ Sample data from ${tableName}:`, sampleData)
        }
      } catch (err) {
        console.log(`❌ Exception getting sample data from ${tableName}:`, err.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

getSchema()
