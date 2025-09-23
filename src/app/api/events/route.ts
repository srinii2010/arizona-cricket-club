import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const format = searchParams.get('format') // optional: T20 | T40
    const from = searchParams.get('from') || new Date().toISOString()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    let query = supabaseAdmin
      .from('events')
      .select(`
        *,
        teams!inner(name),
        seasons!inner(name, year),
        tournament_formats!inner(name)
      `)
      .gte('starts_at', from)
      .order('starts_at', { ascending: true })

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    if (format) {
      // Filter by tournament format name
      query = query.eq('tournament_formats.name', format)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ events: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/events - Starting request')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email, 'Role:', (session?.user as { role?: string } | undefined)?.role)
    
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session || !role || !['editor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized - Editor or Admin access required' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      console.log('Supabase admin client not configured')
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    
    const {
      team_id,
      season_id,
      tournament_format_id,
      title,
      opposition,
      type,
      location,
      notes,
      starts_at,
      ends_at,
    } = body

    if (!team_id || !season_id || !tournament_format_id || !title || !type || !location || !starts_at) {
      console.log('Missing required fields:', { team_id, season_id, tournament_format_id, title, type, location, starts_at })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    console.log('Inserting event with data:', {
      team_id,
      season_id,
      tournament_format_id,
      title,
      opposition: opposition ?? null,
      type,
      location,
      notes: notes ?? null,
      starts_at,
      ends_at: ends_at ?? null,
      created_by: createdByUserId,
    })

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([
        {
          team_id,
          season_id,
          tournament_format_id,
          title,
          opposition: opposition ?? null,
          type,
          location,
          notes: notes ?? null,
          starts_at,
          ends_at: ends_at ?? null,
          created_by: createdByUserId,
        },
      ])
      .select(`
        *,
        teams!inner(name),
        seasons!inner(name, year),
        tournament_formats!inner(name)
      `)
      .single()

    if (error) {
      console.log('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Event created successfully:', data)
    return NextResponse.json({ event: data }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


