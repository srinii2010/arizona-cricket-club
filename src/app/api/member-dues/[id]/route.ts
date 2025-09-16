import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: dues, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching member dues:', error);
      return NextResponse.json({ error: 'Member dues not found' }, { status: 404 });
    }

    return NextResponse.json({ dues });
  } catch (error) {
    console.error('Error in GET /api/member-dues/[id]:', error);
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
      tournament_format_ids,
      season_dues,
      extra_jersey_dues,
      extra_trouser_dues,
      credit_adjustment,
      due_date,
      payment_status,
      settlement_date,
      comments
    } = body;

    // Validate tournament format IDs if provided
    if (tournament_format_ids) {
      const { data: formats } = await supabaseAdmin
        .from('tournament_formats')
        .select('id')
        .in('id', tournament_format_ids);

      if (!formats || formats.length !== tournament_format_ids.length) {
        return NextResponse.json({ error: 'One or more tournament format IDs are invalid' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};
    
    if (tournament_format_ids !== undefined) updateData.tournament_format_ids = tournament_format_ids;
    if (season_dues !== undefined) updateData.season_dues = parseFloat(season_dues);
    if (extra_jersey_dues !== undefined) updateData.extra_jersey_dues = parseFloat(extra_jersey_dues);
    if (extra_trouser_dues !== undefined) updateData.extra_trouser_dues = parseFloat(extra_trouser_dues);
    if (credit_adjustment !== undefined) updateData.credit_adjustment = parseFloat(credit_adjustment);
    if (due_date !== undefined) updateData.due_date = due_date;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (settlement_date !== undefined) updateData.settlement_date = settlement_date;
    if (comments !== undefined) updateData.comments = comments;
    
    // Add audit field
    updateData.last_updated_by = userEmail;

    // Calculate total dues if any amount fields are being updated
    if (season_dues !== undefined || extra_jersey_dues !== undefined || extra_trouser_dues !== undefined || credit_adjustment !== undefined) {
      // Get current values first
      const { data: currentDues } = await supabaseAdmin
        .from('member_dues')
        .select('season_dues, extra_jersey_dues, extra_trouser_dues, credit_adjustment')
        .eq('id', params.id)
        .single();

      if (currentDues) {
        const newSeasonDues = season_dues !== undefined ? parseFloat(season_dues) : currentDues.season_dues;
        const newExtraJerseyDues = extra_jersey_dues !== undefined ? parseFloat(extra_jersey_dues) : currentDues.extra_jersey_dues;
        const newExtraTrouserDues = extra_trouser_dues !== undefined ? parseFloat(extra_trouser_dues) : currentDues.extra_trouser_dues;
        const newCreditAdjustment = credit_adjustment !== undefined ? parseFloat(credit_adjustment) : currentDues.credit_adjustment;
        
        updateData.total_dues = newSeasonDues + newExtraJerseyDues + newExtraTrouserDues + newCreditAdjustment;
      }
    }

    // Update member dues
    const { data: dues, error } = await supabaseAdmin
      .from('member_dues')
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
        )
      `)
      .single();

    if (error) {
      console.error('Error updating member dues:', error);
      return NextResponse.json({ error: 'Failed to update member dues' }, { status: 500 });
    }

    return NextResponse.json({ dues });
  } catch (error) {
    console.error('Error in PUT /api/member-dues/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('member_dues')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting member dues:', error);
      return NextResponse.json({ error: 'Failed to delete member dues' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Member dues deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/member-dues/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
