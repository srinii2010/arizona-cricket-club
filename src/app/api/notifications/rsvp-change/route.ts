import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const { eventId, memberId, oldStatus, newStatus } = await request.json()

    if (!eventId || !memberId || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select(`
        id,
        title,
        starts_at,
        team_id,
        teams!inner(name)
      `)
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get member details
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('first_name, last_name, email')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get team admins
    const { data: teamAdmins, error: adminsError } = await supabaseAdmin
      .from('members')
      .select('email, first_name, last_name')
      .eq('team_id', event.team_id)
      .eq('role', 'admin')

    if (adminsError) {
      return NextResponse.json({ error: adminsError.message }, { status: 500 })
    }

    // Create notification for each team admin
    const notifications = teamAdmins.map(admin => ({
      event_id: eventId,
      member_id: memberId,
      admin_id: admin.email, // Using email as identifier
      notification_type: 'rsvp_change',
      title: 'RSVP Status Changed',
      message: `${member.first_name} ${member.last_name} changed their RSVP for "${event.title}" from ${oldStatus || 'Not Selected'} to ${newStatus}`,
      is_read: false,
      created_at: new Date().toISOString()
    }))

    // Insert notifications
    const { data: insertedNotifications, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)
      .select()

    if (insertError) {
      console.error('Failed to insert notifications:', insertError)
      // Don't fail the request if notifications fail
    }

    return NextResponse.json({ 
      success: true, 
      notificationsSent: insertedNotifications?.length || 0 
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
