import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: expense, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching general expense:', error);
      return NextResponse.json({ error: 'General expense not found' }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error in GET /api/general-expenses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userEmail = await getUserEmailFromRequest(request);
    const {
      tournament_format_id,
      category,
      description,
      amount,
      paid_by_member_id,
      settlement_status,
      settlement_date,
      comments
    } = body;

    // Validate category if provided
    if (category) {
      const validCategories = ['Umpire', 'Equipment', 'Storage', 'LiveStream', 'Mat', 'Food', 'Others'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }

      // If category is 'Others', description is required
      if (category === 'Others' && !description) {
        return NextResponse.json({ error: 'Description is required when category is "Others"' }, { status: 400 });
      }
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

    // Validate member ID if provided
    if (paid_by_member_id) {
      const { data: member } = await supabaseAdmin
        .from('members')
        .select('id')
        .eq('id', paid_by_member_id)
        .single();

      if (!member) {
        return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    
    if (tournament_format_id !== undefined) updateData.tournament_format_id = tournament_format_id;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (paid_by_member_id !== undefined) updateData.paid_by_member_id = paid_by_member_id;
    if (settlement_status !== undefined) updateData.settlement_status = settlement_status;
    if (settlement_date !== undefined) updateData.settlement_date = settlement_date;
    if (comments !== undefined) updateData.comments = comments;
    
    // Add audit field
    updateData.last_updated_by = userEmail;

    // Update general expense
    const { data: expense, error } = await supabaseAdmin
      .from('general_expenses')
      .update(updateData)
      .eq('id', params.id)
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
      console.error('Error updating general expense:', error);
      return NextResponse.json({ error: 'Failed to update general expense' }, { status: 500 });
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Error in PUT /api/general-expenses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('general_expenses')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting general expense:', error);
      return NextResponse.json({ error: 'Failed to delete general expense' }, { status: 500 });
    }

    return NextResponse.json({ message: 'General expense deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/general-expenses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
