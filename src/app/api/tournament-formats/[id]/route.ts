import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: format, error } = await supabaseAdmin
      .from('tournament_formats')
      .select(`
        *,
        seasons (
          id,
          year,
          name
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching tournament format:', error);
      return NextResponse.json({ error: 'Tournament format not found' }, { status: 404 });
    }

    return NextResponse.json({ format });
  } catch (error) {
    console.error('Error in GET /api/tournament-formats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get current format to check season_id
    const { data: currentFormat } = await supabaseAdmin
      .from('tournament_formats')
      .select('season_id')
      .eq('id', params.id)
      .single();

    if (!currentFormat) {
      return NextResponse.json({ error: 'Tournament format not found' }, { status: 404 });
    }

    // Check if another format with same name exists for this season
    const { data: existingFormat } = await supabaseAdmin
      .from('tournament_formats')
      .select('id')
      .eq('season_id', currentFormat.season_id)
      .eq('name', name)
      .neq('id', params.id)
      .single();

    if (existingFormat) {
      return NextResponse.json({ error: 'Tournament format with this name already exists for this season' }, { status: 400 });
    }

    // Update tournament format
    const { data: format, error } = await supabaseAdmin
      .from('tournament_formats')
      .update({
        name,
        description: description || null
      })
      .eq('id', params.id)
      .select(`
        *,
        seasons (
          id,
          year,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating tournament format:', error);
      return NextResponse.json({ error: 'Failed to update tournament format' }, { status: 500 });
    }

    return NextResponse.json({ format });
  } catch (error) {
    console.error('Error in PUT /api/tournament-formats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if format has any associated data
    const { data: memberDues } = await supabaseAdmin
      .from('member_dues')
      .select('id')
      .contains('tournament_format_ids', [params.id])
      .limit(1);

    const { data: generalExpenses } = await supabaseAdmin
      .from('general_expenses')
      .select('id')
      .eq('tournament_format_id', params.id)
      .limit(1);

    if (memberDues && memberDues.length > 0) {
      return NextResponse.json({ error: 'Cannot delete tournament format with existing member dues' }, { status: 400 });
    }

    if (generalExpenses && generalExpenses.length > 0) {
      return NextResponse.json({ error: 'Cannot delete tournament format with existing general expenses' }, { status: 400 });
    }

    // Delete tournament format
    const { error } = await supabaseAdmin
      .from('tournament_formats')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting tournament format:', error);
      return NextResponse.json({ error: 'Failed to delete tournament format' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tournament format deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/tournament-formats/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
