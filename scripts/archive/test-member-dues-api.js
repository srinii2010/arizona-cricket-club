const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMemberDuesAPI() {
  console.log('Testing Member Dues API...\n');

  try {
    // 1. Test GET /api/member-dues
    console.log('1. Testing GET /api/member-dues...');
    const response = await fetch('http://localhost:3000/api/member-dues');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ GET /api/member-dues working');
      console.log('Found', data.dues?.length || 0, 'member dues');
    } else {
      console.log('❌ GET /api/member-dues failed:', data.error);
    }

    // 2. Test POST /api/member-dues (create a test entry)
    console.log('\n2. Testing POST /api/member-dues...');
    
    // First, get a member ID
    const { data: members } = await supabase
      .from('members')
      .select('id')
      .limit(1);

    if (!members || members.length === 0) {
      console.log('❌ No members found. Please add a member first.');
      return;
    }

    const memberId = members[0].id;
    console.log('Using member ID:', memberId);

    // Get a tournament format ID
    const { data: formats } = await supabase
      .from('tournament_formats')
      .select('id')
      .limit(1);

    if (!formats || formats.length === 0) {
      console.log('❌ No tournament formats found. Please create a season first.');
      return;
    }

    const formatId = formats[0].id;
    console.log('Using tournament format ID:', formatId);

    const testDues = {
      member_id: memberId,
      year: 2025,
      tournament_format_ids: [formatId],
      season_dues: 100.00,
      extra_jersey_dues: 25.00,
      extra_trouser_dues: 0,
      credit_adjustment: 0,
      due_date: '2025-12-31',
      comments: 'Test dues entry'
    };

    const postResponse = await fetch('http://localhost:3000/api/member-dues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDues),
    });

    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST /api/member-dues working');
      console.log('Created dues entry:', postData.dues?.id);
    } else {
      console.log('❌ POST /api/member-dues failed:', postData.error);
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testMemberDuesAPI();
