import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const season_id = searchParams.get('season_id');

    let query = supabaseAdmin
      .from('tournament_formats')
      .select(`
        *,
        seasons (
          id,
          year,
          name
        )
      `)
      .order('name', { ascending: true });

    if (season_id) {
      query = query.eq('season_id', season_id);
    }

    const { data: formats, error } = await query;

    if (error) {
      console.error('Error fetching tournament formats:', error);
      return NextResponse.json({ error: 'Failed to fetch tournament formats' }, { status: 500 });
    }

    return NextResponse.json({ formats });
  } catch (error) {
    console.error('Error in GET /api/tournament-formats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { season_id, name, description } = body;

    // Validate required fields
    if (!season_id || !name) {
      return NextResponse.json({ error: 'Season ID and name are required' }, { status: 400 });
    }

    // Check if format with same name already exists for this season
    const { data: existingFormat } = await supabaseAdmin
      .from('tournament_formats')
      .select('id')
      .eq('season_id', season_id)
      .eq('name', name)
      .single();

    if (existingFormat) {
      return NextResponse.json({ error: 'Tournament format with this name already exists for this season' }, { status: 400 });
    }

    // Create tournament format
    const { data: format, error } = await supabaseAdmin
      .from('tournament_formats')
      .insert({
        season_id,
        name,
        description: description || null
      })
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
      console.error('Error creating tournament format:', error);
      return NextResponse.json({ error: 'Failed to create tournament format' }, { status: 500 });
    }

    return NextResponse.json({ format }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tournament-formats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
