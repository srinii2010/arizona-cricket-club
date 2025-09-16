import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserEmailFromRequest } from '@/lib/auth-utils'

// GET /api/members/:id -> get single member
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('*, teams:team_id(name)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ member: data })
}

// PUT /api/members/:id -> update member
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await req.json()
    const userEmail = await getUserEmailFromRequest(req)

    const updatable = ['first_name','last_name','email','phone','team_id','role','date_of_birth','gender']
    const update: Record<string, any> = {}
    for (const k of updatable) {
      if (k in body) update[k] = body[k]
    }
    
    // Add audit field
    update.last_updated_by = userEmail

    const { data, error } = await supabaseAdmin
      .from('members')
      .update(update)
      .eq('id', id)
      .select('*, teams:team_id(name)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ member: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Invalid JSON' }, { status: 400 })
  }
}

// DELETE /api/members/:id -> delete member
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const { error } = await supabaseAdmin
    .from('members')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}


