import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session || !role || !['editor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized - Editor or Admin access required' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await request.json()
    const {
      team_id,
      season_id,
      tournament_format_id,
      game_count
    } = body

    if (!team_id || !season_id || !tournament_format_id || !game_count) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get team, season, and format details for naming
    const [teamRes, seasonRes, formatRes] = await Promise.all([
      supabaseAdmin.from('teams').select('name').eq('id', team_id).single(),
      supabaseAdmin.from('seasons').select('name, year').eq('id', season_id).single(),
      supabaseAdmin.from('tournament_formats').select('name').eq('id', tournament_format_id).single()
    ])

    if (teamRes.error || seasonRes.error || formatRes.error) {
      return NextResponse.json({ error: 'Invalid team, season, or format' }, { status: 400 })
    }

    const teamName = teamRes.data.name
    const seasonName = seasonRes.data.name
    const formatName = formatRes.data.name

    // Get user ID from users table by email since NextAuth provides email
    const userEmail = (session.user as { email?: string })?.email
    let createdByUserId = null
    
    if (userEmail) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      if (!userError && userData) {
        createdByUserId = userData.id
      }
    }

    // Create events array
    const events = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7) // Start 1 week from now

    for (let i = 0; i < game_count; i++) {
      const gameDate = new Date(startDate)
      gameDate.setDate(gameDate.getDate() + (i * 7)) // Weekly games
      gameDate.setHours(18, 0, 0, 0) // 6 PM start time

      const endDate = new Date(gameDate)
      endDate.setHours(21, 0, 0, 0) // 9 PM end time

      events.push({
        team_id,
        season_id,
        tournament_format_id,
        title: `${teamName} vs Opponent - Game ${i + 1}`,
        type: 'match',
        location: 'Nichols Park Basin',
        notes: `${seasonName} - ${formatName} League`,
        starts_at: gameDate.toISOString(),
        ends_at: endDate.toISOString(),
        created_by: createdByUserId,
      })
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(events)
      .select(`
        *,
        teams!inner(name),
        seasons!inner(name, year),
        tournament_formats!inner(name)
      `)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
