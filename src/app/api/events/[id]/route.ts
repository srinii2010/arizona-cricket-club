import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        teams!inner(name),
        seasons!inner(name, year),
        tournament_formats!inner(name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session || !role || !['editor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized - Editor or Admin access required' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Note: updated_by field is not currently being set in the update

    const { data, error } = await supabaseAdmin
      .from('events')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        teams!inner(name),
        seasons!inner(name, year),
        tournament_formats!inner(name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (!session || !role || !['admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required for deletion' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id } = await params
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
