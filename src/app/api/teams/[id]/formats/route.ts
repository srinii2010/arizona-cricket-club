import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id } = await params

    // Verify the user belongs to this team
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('team_id')
      .eq('email', session.user.email)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.team_id !== id) {
      return NextResponse.json({ error: 'Access denied - different team' }, { status: 403 })
    }

    // Get all seasons with their tournament formats (same as seasons API)
    const { data: seasons, error: seasonsError } = await supabaseAdmin
      .from('seasons')
      .select(`
        id,
        year,
        name,
        status,
        tournament_formats (
          id,
          name,
          description
        )
      `)
      .order('year', { ascending: false })

    if (seasonsError) {
      return NextResponse.json({ error: seasonsError.message }, { status: 500 })
    }

    // Flatten seasons and formats, then filter by events
    const formatsWithEvents = []
    for (const season of seasons || []) {
      for (const format of season.tournament_formats || []) {
        // Check if this team has upcoming events for this format
        const { data: events } = await supabaseAdmin
          .from('events')
          .select('id')
          .eq('team_id', id)
          .eq('tournament_format_id', format.id)
          .gte('starts_at', new Date().toISOString())
          .limit(1)
        
        if (events && events.length > 0) {
          formatsWithEvents.push({
            id: format.id,
            name: format.name,
            description: format.description,
            seasonId: season.id,
            seasonName: season.name,
            seasonYear: season.year
          })
        }
      }
    }

    // Sort by season year (newest first) then by format name
    formatsWithEvents.sort((a, b) => {
      if (a.seasonYear !== b.seasonYear) {
        return b.seasonYear - a.seasonYear // Newest year first
      }
      return a.name.localeCompare(b.name) // Then by format name
    })

    return NextResponse.json({ formats: formatsWithEvents })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
