import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserEmailFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('seasons')
      .select(`
        *,
        tournament_formats (
          id,
          name,
          description
        )
      `)
      .order('year', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: seasons, error } = await query;

    if (error) {
      console.error('Error fetching seasons:', error);
      return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
    }

    return NextResponse.json({ seasons });
  } catch (error) {
    console.error('Error in GET /api/seasons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userEmail = await getUserEmailFromRequest(request);
    const { year, name, status = 'Active', tournament_formats = [] } = body;

    // Validate required fields
    if (!year || !name) {
      return NextResponse.json({ error: 'Year and name are required' }, { status: 400 });
    }

    // Check if season with same year already exists
    const { data: existingSeason } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('year', year)
      .single();

    if (existingSeason) {
      return NextResponse.json({ error: 'Season for this year already exists' }, { status: 400 });
    }

    // Create season
    const { data: season, error: seasonError } = await supabaseAdmin
      .from('seasons')
      .insert({
        year,
        name,
        status,
        created_by: userEmail,
        last_updated_by: userEmail
      })
      .select()
      .single();

    if (seasonError) {
      console.error('Error creating season:', seasonError);
      return NextResponse.json({ error: 'Failed to create season' }, { status: 500 });
    }

    // Create tournament formats if provided
    if (tournament_formats.length > 0) {
      const formatsToInsert = tournament_formats.map((format: any) => ({
        season_id: season.id,
        name: format.name,
        description: format.description || null
      }));

      const { error: formatsError } = await supabaseAdmin
        .from('tournament_formats')
        .insert(formatsToInsert);

      if (formatsError) {
        console.error('Error creating tournament formats:', formatsError);
        // Don't fail the entire request, just log the error
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
      .eq('id', season.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete season:', fetchError);
      return NextResponse.json({ season });
    }

    return NextResponse.json({ season: completeSeason }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/seasons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
