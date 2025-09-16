require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserID() {
  console.log('🔧 Fixing User ID in Database')
  console.log('==============================')
  
  const oldUserID = '4943c0da-b1d3-4231-91f0-d53c95bae63c'  // Current UUID in DB
  const newUserID = '111504681471508856538'  // Google user ID
  const email = 'srinii2005@gmail.com'
  
  try {
    // Step 1: Check current record
    console.log('\n1️⃣ Checking current record...')
    const { data: currentRecord, error: currentError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', oldUserID)
    
    if (currentError) {
      console.log('❌ Error checking current record:', currentError.message)
      return
    }
    
    if (currentRecord.length === 0) {
      console.log('❌ No record found with old user ID')
      return
    }
    
    console.log('✅ Found current record:')
    console.log(`   ID: ${currentRecord[0].id}`)
    console.log(`   User ID: ${currentRecord[0].user_id}`)
    console.log(`   Role: ${currentRecord[0].role}`)
    
    // Step 2: Update the user_id to the Google user ID
    console.log('\n2️⃣ Updating user_id to Google user ID...')
    const { data: updatedRecord, error: updateError } = await supabase
      .from('user_roles')
      .update({ user_id: newUserID })
      .eq('user_id', oldUserID)
      .select()
    
    if (updateError) {
      console.log('❌ Error updating record:', updateError.message)
      return
    }
    
    console.log('✅ Successfully updated record:')
    console.log(`   ID: ${updatedRecord[0].id}`)
    console.log(`   New User ID: ${updatedRecord[0].user_id}`)
    console.log(`   Role: ${updatedRecord[0].role}`)
    
    // Step 3: Verify the update
    console.log('\n3️⃣ Verifying update...')
    const { data: verifyRecord, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', newUserID)
    
    if (verifyError) {
      console.log('❌ Error verifying record:', verifyError.message)
      return
    }
    
    if (verifyRecord.length > 0) {
      console.log('✅ Verification successful!')
      console.log(`   Found record with Google user ID: ${verifyRecord[0].user_id}`)
      console.log(`   Role: ${verifyRecord[0].role}`)
    } else {
      console.log('❌ Verification failed - record not found')
    }
    
    console.log('\n🎉 Database updated successfully!')
    console.log('Now try logging in again - it should work!')
    
  } catch (error) {
    console.error('❌ Exception:', error.message)
  }
}

fixUserID()
