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

    // First, get the event details to verify the user's team
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        team_id,
        teams!inner(name)
      `)
      .eq('id', id)
      .single() as { data: { team_id: string; teams: { name: string } } | null; error: unknown }

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get the user's team to verify they belong to the same team
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('team_id, role')
      .eq('email', session.user.email)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify the member belongs to the same team as the event
    if (member.team_id !== event.team_id) {
      return NextResponse.json({ error: 'Access denied - different team' }, { status: 403 })
    }

    // Get all team members with their RSVP status for this event
    const { data: teamMembers, error: membersError } = await supabaseAdmin
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        rsvps!left(
          status,
          responded_at
        )
      `)
      .eq('team_id', event.team_id)
      .eq('rsvps.event_id', id)

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 })
    }

    // Also get members who haven't RSVP'd yet
    const { data: allTeamMembers, error: allMembersError } = await supabaseAdmin
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role
      `)
      .eq('team_id', event.team_id)

    if (allMembersError) {
      return NextResponse.json({ error: allMembersError.message }, { status: 500 })
    }

    // Combine the data and format it properly
    const membersWithRsvp = allTeamMembers.map(member => {
      const rsvp = teamMembers.find(tm => tm.id === member.id)?.rsvps?.[0]
      return {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        role: member.role,
        rsvpStatus: rsvp?.status || null,
        respondedAt: rsvp?.responded_at || null
      }
    })

    // Sort by RSVP status: Yes, No, Maybe, Not Selected
    const sortOrder = { 'yes': 1, 'no': 2, 'maybe': 3, null: 4 }
    membersWithRsvp.sort((a, b) => {
      const aOrder = sortOrder[a.rsvpStatus as keyof typeof sortOrder] || 4
      const bOrder = sortOrder[b.rsvpStatus as keyof typeof sortOrder] || 4
      if (aOrder !== bOrder) return aOrder - bOrder
      // Secondary sort by name
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    })

    return NextResponse.json({ 
      teamMembers: membersWithRsvp,
      event: {
        id,
        teamId: event.team_id,
        teamName: event.teams.name
      }
    })
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { id } = await params
    const { memberId, status } = await request.json()

    if (!['yes', 'no', 'maybe'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify the user is an admin of the team for this event
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        team_id,
        teams!inner(name)
      `)
      .eq('id', id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get the user's role from the users table (RBAC) to verify they're an admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found in access management' }, { status: 404 })
    }

    // Verify the user is an admin (from users table)
    console.log('Admin check - User role from users table:', user.role)
    
    if (user.role !== 'admin') {
      console.log('Access denied - User role:', user.role)
      return NextResponse.json({ error: 'Access denied - admin access required' }, { status: 403 })
    }

    // Get current RSVP status before updating
    const { data: currentRsvp } = await supabaseAdmin
      .from('rsvps')
      .select('status')
      .eq('event_id', id)
      .eq('member_id', memberId)
      .single()

    // Update the RSVP
    const { data, error } = await supabaseAdmin
      .from('rsvps')
      .upsert({
        event_id: id,
        member_id: memberId,
        status,
        responded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send notification to team admins if status changed
    if (currentRsvp?.status !== status) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/rsvp-change`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: id,
            memberId: memberId,
            oldStatus: currentRsvp?.status || null,
            newStatus: status
          })
        })
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the RSVP update if notification fails
      }
    }

    return NextResponse.json({ rsvp: data }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
