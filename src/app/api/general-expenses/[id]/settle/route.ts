import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const userEmail = await getUserEmailFromRequest(request);
    const { settlement_date } = body;

    // Update general expense to mark as settled
    const { data: expense, error } = await supabaseAdmin
      .from('general_expenses')
      .update({
        settlement_status: 'Settled',
        settlement_date: settlement_date || new Date().toISOString().split('T')[0],
        last_updated_by: userEmail
      })
      .eq('id', id)
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
      console.error('Error settling general expense:', error);
      return NextResponse.json({ error: 'Failed to settle general expense' }, { status: 500 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error in POST /api/general-expenses/[id]/settle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
