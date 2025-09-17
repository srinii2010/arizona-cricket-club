import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserEmailFromRequest } from '@/lib/auth-utils'

// GET /api/members -> list members with team name (supports ?team_id=)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('team_id')

  let query = supabaseAdmin
    .from('members')
    .select('*, teams:team_id(name)')
    .order('first_name', { ascending: true })

  if (teamId) {
    query = query.eq('team_id', teamId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ members: data ?? [] })
}

// POST /api/members -> create a member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userEmail = await getUserEmailFromRequest(req)

    const required = ['first_name', 'last_name', 'email', 'phone', 'team_id', 'role']
    for (const key of required) {
      if (!body?.[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 })
      }
    }

    const payload = {
      first_name: String(body.first_name).trim(),
      last_name: String(body.last_name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone).trim(),
      team_id: body.team_id,
      role: String(body.role).trim(),
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      created_by: userEmail,
      last_updated_by: userEmail,
    }

    const { data, error } = await supabaseAdmin
      .from('members')
      .insert([payload])
      .select('*, teams:team_id(name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data }, { status: 201 })
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}


