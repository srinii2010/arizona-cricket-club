import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: season, error } = await supabaseAdmin
      .from('seasons')
      .select(`
        *,
        tournament_formats (
          id,
          name,
          description
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching season:', error);
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    return NextResponse.json({ season });
  } catch (error) {
    console.error('Error in GET /api/seasons/[id]:', error);
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
    const { year, name, status, tournament_formats } = body;

    // Validate required fields
    if (!year || !name) {
      return NextResponse.json({ error: 'Year and name are required' }, { status: 400 });
    }

    // Check if another season with same year exists (excluding current one)
    const { data: existingSeason } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('year', year)
      .neq('id', params.id)
      .single();

    if (existingSeason) {
      return NextResponse.json({ error: 'Season for this year already exists' }, { status: 400 });
    }

    // Update season
    const { data: season, error: seasonError } = await supabaseAdmin
      .from('seasons')
      .update({
        year,
        name,
        status,
        last_updated_by: userEmail
      })
      .eq('id', params.id)
      .select()
      .single();

    if (seasonError) {
      console.error('Error updating season:', seasonError);
      return NextResponse.json({ error: 'Failed to update season' }, { status: 500 });
    }

    // Update tournament formats if provided
    if (tournament_formats) {
      // Delete existing formats
      await supabaseAdmin
        .from('tournament_formats')
        .delete()
        .eq('season_id', params.id);

      // Insert new formats
      if (tournament_formats.length > 0) {
        const formatsToInsert = tournament_formats.map((format: any) => ({
          season_id: params.id,
          name: format.name,
          description: format.description || null
        }));

        const { error: formatsError } = await supabaseAdmin
          .from('tournament_formats')
          .insert(formatsToInsert);

        if (formatsError) {
          console.error('Error updating tournament formats:', formatsError);
          // Don't fail the entire request, just log the error
        }
      }
    }

    // Fetch the complete season with formats
    const { data: completeSeason, error: fetchError } = await supabaseAdmin
      .from('seasons')
      .select(`
        *,
        tournament_formats (
          id,
          name,
          description
        )
      `)
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete season:', fetchError);
      return NextResponse.json({ season });
    }

    return NextResponse.json({ season: completeSeason });
  } catch (error) {
    console.error('Error in PUT /api/seasons/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if season has any associated data
    const { data: memberDues } = await supabaseAdmin
      .from('member_dues')
      .select('id')
      .eq('year', (await supabaseAdmin.from('seasons').select('year').eq('id', params.id).single()).data?.year)
      .limit(1);

    const { data: generalExpenses } = await supabaseAdmin
      .from('general_expenses')
      .select('id')
      .eq('year', (await supabaseAdmin.from('seasons').select('year').eq('id', params.id).single()).data?.year)
      .limit(1);

    if (memberDues && memberDues.length > 0) {
      return NextResponse.json({ error: 'Cannot delete season with existing member dues' }, { status: 400 });
    }

    if (generalExpenses && generalExpenses.length > 0) {
      return NextResponse.json({ error: 'Cannot delete season with existing general expenses' }, { status: 400 });
    }

    // Delete season (cascade will handle tournament_formats)
    const { error } = await supabaseAdmin
      .from('seasons')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting season:', error);
      return NextResponse.json({ error: 'Failed to delete season' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/seasons/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
