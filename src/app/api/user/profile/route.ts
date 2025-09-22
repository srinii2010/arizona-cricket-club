import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get user's member profile
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        team_id,
        role
      `)
      .eq('email', session.user.email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No member found with this email
        return NextResponse.json({ 
          error: 'Member profile not found',
          member: null 
        }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get team information separately
    let teamName = 'Unknown Team'
    if (member.team_id) {
      const { data: team } = await supabaseAdmin
        .from('teams')
        .select('name')
        .eq('id', member.team_id)
        .single()
      
      if (team) {
        teamName = team.name
      }
    }

    return NextResponse.json({ 
      member: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        teamId: member.team_id,
        teamName: teamName,
        role: member.role
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}