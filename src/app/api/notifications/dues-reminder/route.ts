import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendDuesReminder, Member } from '@/lib/email'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Get member IDs with unpaid dues
    const { data: unpaidDues, error: duesError } = await supabase
      .from('member_dues')
      .select('member_id')
      .neq('payment_status', 'paid')
      .is('settlement_date', null)

    if (duesError) {
      console.error('Error fetching member dues:', duesError)
      return NextResponse.json({ error: 'Failed to fetch member dues' }, { status: 500 })
    }

    if (!unpaidDues || unpaidDues.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No members with unpaid dues found',
        count: 0
      })
    }

    // Get member details for those with unpaid dues
    const memberIds = unpaidDues.map(dues => dues.member_id)
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, role')
      .in('id', memberIds)

    if (membersError) {
      console.error('Error fetching members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Transform the data to match Member interface
    const members: Member[] = membersData?.map(member => ({
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      team_id: undefined,
      date_of_birth: undefined,
      gender: undefined,
      created_at: undefined,
      updated_at: undefined
    })) || []

    if (members.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No members with unpaid dues found',
        count: 0
      })
    }

    // Send dues reminder emails
    const result = await sendDuesReminder(members)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        count: members.length,
        message: `Dues reminder sent to ${members.length} members`
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send dues reminder', 
        details: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Dues reminder error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}