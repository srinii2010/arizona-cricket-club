import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type RbacRole = 'admin' | 'editor' | 'viewer' | 'none'

// GET /api/access
// Returns members with their RBAC role (from users.role). If no users record, role = 'none'.
export async function GET() {
  // Load members (source of truth for people)
  const { data: members, error: membersError } = await supabaseAdmin
    .from('members')
    .select('id, first_name, last_name, email, team_id, role, teams:team_id(name)')
    .order('first_name', { ascending: true })

  if (membersError) {
    return NextResponse.json({ error: membersError.message }, { status: 500 })
  }

  // Load users table (RBAC) to map by email
  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('email, role, name')

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const emailToRole = new Map<string, string>()
  for (const u of users ?? []) {
    if (u.email) emailToRole.set(u.email.toLowerCase(), (u.role as string) || 'none')
  }

  const result = (members ?? []).map((m) => ({
    member_id: m.id,
    name: `${m.first_name} ${m.last_name}`.trim(),
    email: m.email,
    team: m.teams?.[0]?.name ?? null,
    rbac_role: (emailToRole.get((m.email || '').toLowerCase()) as RbacRole) || 'none',
    member_role: m.role
  }))

  return NextResponse.json({ members: result })
}

// POST /api/access
// Body: { email: string; role: 'admin' | 'editor' | 'viewer' | 'none'; name?: string }
// Sets RBAC role for the given email in users table. If 'none', clears role (or removes record if desired).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const role: RbacRole = body?.role
    const name: string | undefined = body?.name

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!['admin', 'editor', 'viewer', 'none'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if users record exists
    const { data: existing, error: findErr } = await supabaseAdmin
      .from('users')
      .select('id, email, role, name')
      .eq('email', email)
      .limit(1)

    if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })

    if (role === 'none') {
      // Strategy: keep record but set role to null (or remove). We'll set to null to preserve history.
      if ((existing?.length || 0) === 0) {
        return NextResponse.json({ ok: true, email, role: 'none' })
      }
      const { error: updateErr } = await supabaseAdmin
        .from('users')
        .update({ role: null })
        .eq('email', email)
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
      return NextResponse.json({ ok: true, email, role: 'none' })
    }

    if ((existing?.length || 0) === 0) {
      // Insert a users record with this email and role
      const insertPayload: { email: string; role: RbacRole; name?: string } = {
        email,
        role,
      }
      if (name) insertPayload.name = name
      const { error: insertErr } = await supabaseAdmin
        .from('users')
        .insert([insertPayload])
      if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
      return NextResponse.json({ ok: true, email, role })
    } else {
      const { error: updateErr } = await supabaseAdmin
        .from('users')
        .update({ role })
        .eq('email', email)
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
      return NextResponse.json({ ok: true, email, role })
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}


