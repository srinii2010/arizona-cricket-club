import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendChangeReport, ChangeReport } from '@/lib/email'

export async function POST(request: NextRequest) {
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
    const isScheduled = request.headers.get('x-cron-secret') === process.env.CRON_SECRET

    // Get changes from last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Fetch new members (created in last 24 hours)
    const newMembersResult = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, team_id, role, created_at')
      .gte('created_at', yesterday.toISOString())

    // Fetch updated members (updated in last 24 hours)
    const updatedMembersResult = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, team_id, role, updated_at')
      .gte('updated_at', yesterday.toISOString())

    // Fetch new expenses (created in last 24 hours)
    const newExpensesResult = await supabase
      .from('general_expenses')
      .select('id, year, category, description, amount, paid_by_member_id, settlement_status, created_at')
      .gte('created_at', yesterday.toISOString())

    // Fetch updated expenses (updated in last 24 hours)
    const updatedExpensesResult = await supabase
      .from('general_expenses')
      .select('id, year, category, description, amount, paid_by_member_id, settlement_status, updated_at')
      .gte('updated_at', yesterday.toISOString())

    // Check for database errors
    const errors = [
      newMembersResult.error,
      updatedMembersResult.error,
      newExpensesResult.error,
      updatedExpensesResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('Database errors:', errors)
      return NextResponse.json({ 
        error: 'Failed to fetch change data',
        details: errors.map(e => e?.message).filter(Boolean)
      }, { status: 500 })
    }

    const report: ChangeReport = {
      newMembers: newMembersResult.data || [],
      updatedMembers: updatedMembersResult.data || [],
      newExpenses: newExpensesResult.data || [],
      updatedExpenses: updatedExpensesResult.data || [],
      totalChanges: (newMembersResult.data?.length || 0) +
                   (updatedMembersResult.data?.length || 0) +
                   (newExpensesResult.data?.length || 0) +
                   (updatedExpensesResult.data?.length || 0)
    }

    // Fetch ALL data for Excel attachment
    const allMembersResult = await supabase
      .from('members')
      .select('id, first_name, last_name, email, phone, team_id, role, date_of_birth, gender, created_at, updated_at')

    const allExpensesResult = await supabase
      .from('general_expenses')
      .select('id, year, tournament_format_id, category, description, amount, paid_by_member_id, settlement_status, settlement_date, comments, created_at, updated_at')

const allMemberDuesResult = await supabase
  .from('member_dues')
  .select('id, member_id, year, tournament_format_ids, season_dues, extra_jersey_dues, extra_trouser_dues, credit_adjustment, due_date, payment_status, settlement_date, comments, total_dues, created_at, updated_at')

    const allTeamsResult = await supabase
      .from('teams')
      .select('id, name, description')

    const recipients = process.env.REPORT_EMAIL_RECIPIENTS?.split(',') || []
    
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No email recipients configured' }, { status: 500 })
    }

    const result = await sendChangeReport(
      report, 
      recipients, 
      !isScheduled, // isOnDemand
      allMembersResult.data || [],
      allExpensesResult.data || [],
      allMemberDuesResult.data || [],
      allTeamsResult.data || []
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        changes: report.totalChanges,
        skipped: result.skipped
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email', 
        details: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Daily report error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}