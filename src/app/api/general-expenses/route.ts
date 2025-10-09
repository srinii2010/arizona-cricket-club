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
    const category = searchParams.get('category');
    const tournament_format_id = searchParams.get('tournament_format_id');
    const settlement_status = searchParams.get('settlement_status');

    let query = supabaseAdmin
      .from('general_expenses')
      .select(`
        *,
        members (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        tournament_formats (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (tournament_format_id) {
      query = query.eq('tournament_format_id', tournament_format_id);
    }

    if (settlement_status) {
      query = query.eq('settlement_status', settlement_status);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Error fetching general expenses:', error);
      return NextResponse.json({ error: 'Failed to fetch general expenses' }, { status: 500 });
    }

    // Calculate totals
    const totals = expenses.reduce((acc, expense) => {
      acc.total_amount += parseFloat(expense.amount);
      if (expense.settlement_status === 'Settled') {
        acc.settled_amount += parseFloat(expense.amount);
      } else {
        acc.pending_amount += parseFloat(expense.amount);
      }
      return acc;
    }, { total_amount: 0, settled_amount: 0, pending_amount: 0 });

    return NextResponse.json({ expenses, totals });
  } catch (error) {
    console.error('Error in GET /api/general-expenses:', error);
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
      year,
      tournament_format_id,
      category,
      description,
      amount,
      paid_by_member_id,
      comments,
      expense_date
    } = body;

    // Validate required fields
    if (!year || !category || !amount || !paid_by_member_id || !expense_date) {
      return NextResponse.json({ 
        error: 'Year, category, amount, paid by member ID, and expense date are required' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['Umpire', 'Equipment', 'Storage', 'LiveStream', 'Mat', 'Food', 'PitchPrep', 'Others'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // If category is 'Others', description is required
    if (category === 'Others' && !description) {
      return NextResponse.json({ error: 'Description is required when category is "Others"' }, { status: 400 });
    }

    // Validate tournament format ID if provided
    if (tournament_format_id) {
      const { data: format } = await supabaseAdmin
        .from('tournament_formats')
        .select('id')
        .eq('id', tournament_format_id)
        .single();

      if (!format) {
        return NextResponse.json({ error: 'Invalid tournament format ID' }, { status: 400 });
      }
    }

    // Validate member ID
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id', paid_by_member_id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    // Create general expense
    const { data: expense, error } = await supabaseAdmin
      .from('general_expenses')
      .insert({
        year,
        tournament_format_id: tournament_format_id || null,
        category,
        description: description || null,
        amount: parseFloat(amount),
        paid_by_member_id,
        comments: comments || null,
        created_at: new Date(expense_date).toISOString(),
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
        ),
        tournament_formats (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating general expense:', error);
      return NextResponse.json({ error: 'Failed to create general expense' }, { status: 500 });
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/general-expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
