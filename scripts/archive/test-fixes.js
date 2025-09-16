const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixes() {
  console.log('Testing Member Dues Fixes...\n');

  try {
    // 1. Test GET to see existing dues
    console.log('1. Testing GET /api/member-dues...');
    const getResponse = await fetch('http://localhost:3000/api/member-dues');
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET working');
      console.log(`Found ${getData.dues?.length || 0} member dues`);
      
      if (getData.dues && getData.dues.length > 0) {
        console.log('\nExisting dues:');
        getData.dues.forEach(dues => {
          console.log(`- ${dues.members?.first_name} ${dues.members?.last_name}: $${dues.total_dues} (${dues.payment_status})`);
        });
      }
    } else {
      console.log('❌ GET failed:', getData.error);
    }

    // 2. Test credit adjustment calculation
    console.log('\n2. Testing credit adjustment calculation...');
    const testData = {
      member_id: 'cb358917-8485-4d12-97f2-b0f1145cb88e',
      year: 2025,
      tournament_format_ids: ['92d88c63-546c-43ab-a4b2-f1a4d59ae8f0'],
      season_dues: 100,
      extra_jersey_dues: 20,
      extra_trouser_dues: 0,
      credit_adjustment: 10,
      due_date: '2025-02-15',
      comments: 'Test with credit adjustment'
    };

    // Calculate expected total: 100 + 20 + 0 - 10 = 110
    const expectedTotal = 100 + 20 + 0 - 10;
    console.log(`Expected total: $${expectedTotal} (100 + 20 + 0 - 10)`);

    // 3. Test POST with different year to avoid duplicate
    console.log('\n3. Testing POST with different year...');
    testData.year = 2027; // Use different year to avoid duplicate
    
    const postResponse = await fetch('http://localhost:3000/api/member-dues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST working');
      console.log(`Created dues with total: $${postData.dues?.total_dues}`);
      console.log(`Credit adjustment: $${postData.dues?.credit_adjustment}`);
      
      // Verify calculation
      if (postData.dues?.total_dues == expectedTotal) {
        console.log('✅ Credit adjustment calculation is correct!');
      } else {
        console.log('❌ Credit adjustment calculation is wrong!');
      }
    } else {
      console.log('❌ POST failed:', postData.error);
    }

    // 4. Test duplicate check
    console.log('\n4. Testing duplicate check...');
    const duplicateResponse = await fetch('http://localhost:3000/api/member-dues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData) // Same data as above
    });

    const duplicateData = await duplicateResponse.json();
    
    if (duplicateResponse.ok) {
      console.log('❌ Duplicate check failed - should have been rejected');
    } else {
      console.log('✅ Duplicate check working:', duplicateData.error);
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testFixes();
