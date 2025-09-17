import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const member_id = searchParams.get('member_id');
    const payment_status = searchParams.get('payment_status');

    let query = supabaseAdmin
      .from('member_dues')
      .select(`
        *,
        members (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('due_date', { ascending: true });

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    if (member_id) {
      query = query.eq('member_id', member_id);
    }

    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }

    const { data: dues, error } = await query;

    if (error) {
      console.error('Error fetching member dues:', error);
      return NextResponse.json({ error: 'Failed to fetch member dues' }, { status: 500 });
    }

    // Calculate totals
    const totals = dues.reduce((acc, due) => {
      acc.total_dues += parseFloat(due.total_dues);
      if (due.payment_status === 'Paid') {
        acc.paid_dues += parseFloat(due.total_dues);
      } else {
        acc.pending_dues += parseFloat(due.total_dues);
      }
      return acc;
    }, { total_dues: 0, paid_dues: 0, pending_dues: 0 });

    return NextResponse.json({ dues, totals });
  } catch (error) {
    console.error('Error in GET /api/member-dues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const userEmail = await getUserEmailFromRequest(request);
    const {
      member_id,
      year,
      tournament_format_ids,
      season_dues,
      extra_jersey_dues = 0,
      extra_trouser_dues = 0,
      credit_adjustment = 0,
      due_date,
      comments
    } = body;

    // Validate required fields
    if (!member_id || !year || !tournament_format_ids || !season_dues || !due_date) {
      return NextResponse.json({ 
        error: 'Member ID, year, tournament format IDs, season dues, and due date are required' 
      }, { status: 400 });
    }

    // Validate due date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (due_date < today) {
      return NextResponse.json({ error: 'Due date cannot be in the past' }, { status: 400 });
    }

    // Validate tournament format IDs exist
    const { data: formats } = await supabaseAdmin
      .from('tournament_formats')
      .select('id')
      .in('id', tournament_format_ids);

    if (!formats || formats.length !== tournament_format_ids.length) {
      return NextResponse.json({ error: 'One or more tournament format IDs are invalid' }, { status: 400 });
    }

    // Check if unpaid dues already exist for this member, year, and format combination
    const { data: existingDues } = await supabaseAdmin
      .from('member_dues')
      .select('id, payment_status')
      .eq('member_id', member_id)
      .eq('year', year)
      .contains('tournament_format_ids', tournament_format_ids)
      .eq('payment_status', 'Not Paid')
      .single();

    if (existingDues) {
      return NextResponse.json({ 
        error: 'Unpaid dues already exist for this member, year, and tournament format combination. Please mark the existing dues as paid before creating new ones.' 
      }, { status: 400 });
    }

    // Create member dues (total_dues will be calculated by database trigger)
    const { data: dues, error } = await supabaseAdmin
      .from('member_dues')
      .insert({
        member_id,
        year,
        tournament_format_ids,
        season_dues: parseFloat(season_dues),
        extra_jersey_dues: parseFloat(extra_jersey_dues),
        extra_trouser_dues: parseFloat(extra_trouser_dues),
        credit_adjustment: parseFloat(credit_adjustment),
        due_date,
        comments: comments || null,
        created_by: userEmail,
        last_updated_by: userEmail
      })
      .select(`
        *,
        members (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .single();

    if (error) {
      console.error('Error creating member dues:', error);
      return NextResponse.json({ error: `Failed to create member dues: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ dues }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/member-dues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
