import { Resend } from 'resend'
import * as XLSX from 'xlsx'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  team_id?: string
  role: string
  date_of_birth?: string
  gender?: string
  created_at?: string
  updated_at?: string
}

export interface Expense {
  id: string
  year: number
  tournament_format_id?: string
  category: string
  description?: string
  amount: number
  paid_by_member_id: string
  settlement_status?: string
  settlement_date?: string
  comments?: string
  created_at?: string
  updated_at?: string
}

export interface MemberDues {
  id: string
  member_id: string
  year: number
  tournament_format_ids?: string[]
  season_dues?: number
  extra_jersey_dues?: number
  extra_trouser_dues?: number
  credit_adjustment?: number
  due_date?: string
  payment_status?: string
  settlement_date?: string
  comments?: string
  total_dues: number
  created_at?: string
  updated_at?: string
}

export interface Team {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface ChangeReport {
  newMembers: Member[]
  updatedMembers: Member[]
  newExpenses: Expense[]
  updatedExpenses: Expense[]
  totalChanges: number
}

function generateExcelReport(members: Member[], expenses: Expense[], memberDues: MemberDues[], teams: Team[]) {
  const workbook = XLSX.utils.book_new()
  
  // Create teams lookup map
  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team.name
    return acc
  }, {} as Record<string, string>)
  
  // Tab 1: Members - Member Name, Email, Phone, Team
  const membersData = members.map(member => ({
    'Member Name': `${member.first_name} ${member.last_name}`,
    'Email': member.email,
    'Phone': member.phone,
    'Team': member.team_id ? (teamsMap[member.team_id] || 'Unknown Team') : 'No Team'
  }))
  
  const membersSheet = XLSX.utils.json_to_sheet(membersData)
  XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members')
  
  // Tab 2: Member Dues by Year
  const duesByYear = memberDues.reduce((acc, dues) => {
    if (!acc[dues.year]) acc[dues.year] = []
    acc[dues.year].push(dues)
    return acc
  }, {} as Record<number, MemberDues[]>)
  
  Object.entries(duesByYear).forEach(([year, yearDues]) => {
    const duesData = yearDues.map(dues => {
      const member = members.find(m => m.id === dues.member_id)
      return {
        'Member Name': member ? `${member.first_name} ${member.last_name}` : 'Unknown Member',
        'Total Dues': dues.total_dues,
        'Status': dues.payment_status || 'Pending',
        'Action': dues.settlement_date ? 'Settled' : 'Pending',
        'Comments': dues.comments || 'N/A'
      }
    })
    
    const duesSheet = XLSX.utils.json_to_sheet(duesData)
    XLSX.utils.book_append_sheet(workbook, duesSheet, `Member Dues ${year}`)
  })
  
  // Tab 3: Expenses by Year
const expensesByYear = expenses.reduce((acc, expense) => {
  const year = expense.year
  if (!acc[year]) acc[year] = []
  acc[year].push(expense)
  return acc
}, {} as Record<number, Expense[]>)

Object.entries(expensesByYear).forEach(([year, yearExpenses]) => {
  const expensesData = yearExpenses.map(expense => {
    const member = members.find(m => m.id === expense.paid_by_member_id)
    
    // Use created_at as the expense date (this matches what the UI shows)
    const expenseDate = expense.created_at ? new Date(expense.created_at).toLocaleDateString() : 'N/A'
    
    return {
      'Category': expense.category,
      'Description': expense.description || 'N/A',
      'Amount': expense.amount,
      'Paid By': member ? `${member.first_name} ${member.last_name}` : 'Unknown Member',
      'Tournament': expense.tournament_format_id ? 'Tournament Expense' : 'General Expense',
      'Status': expense.settlement_status || 'Pending',
      'Expense Date': expenseDate,
      'Actions': expense.comments || 'N/A'
    }
  })
  
  const expensesSheet = XLSX.utils.json_to_sheet(expensesData)
  XLSX.utils.book_append_sheet(workbook, expensesSheet, `Expenses ${year}`)
})
  
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return excelBuffer
}

export async function sendDuesReminder(members: Member[]) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Arizona Cricket Club - Dues Reminder</h2>
      <p>Dear Members,</p>
      <p>This is a reminder that the following members have outstanding dues:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Name</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Email</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(member => `
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 8px;">${member.first_name} ${member.last_name}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">${member.email}</td>
              <td style="border: 1px solid #d1d5db; padding: 8px;">$0</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <p>Please contact the club administration to settle your dues.</p>
      <p>Thank you,<br>Arizona Cricket Club</p>
    </div>
  `

  try {
    const result = await resend.emails.send({
      from: 'Arizona Cricket Club <onboarding@resend.dev>',
      to: members.map(m => m.email),
      subject: 'Arizona Cricket Club - Dues Reminder',
      html
    })
    
    console.log('Dues reminder sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('Error sending dues reminder:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendChangeReport(
  report: ChangeReport, 
  recipients: string[], 
  isOnDemand = false, 
  allMembers: Member[] = [], 
  allExpenses: Expense[] = [],
  allMemberDues: MemberDues[] = [],
  allTeams: Team[] = []
) {
  const { newMembers, updatedMembers, newExpenses, updatedExpenses, totalChanges } = report
  
  if (totalChanges === 0 && !isOnDemand) {
    console.log('No changes detected, skipping email')
    return { success: true, skipped: true }
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Arizona Cricket Club - ${isOnDemand ? 'On-Demand' : 'Daily'} Change Report</h2>
      <p>Report generated: ${new Date().toLocaleString('en-US', { timeZone: 'America/Phoenix' })}</p>
      
      ${totalChanges === 0 ? `
        <p style="color: #6b7280; font-style: italic;">No changes detected in the last 24 hours.</p>
      ` : `
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1; margin: 0;">Summary</h3>
          <p style="margin: 5px 0;">Total Changes: ${totalChanges}</p>
          <p style="margin: 5px 0;">New Members: ${newMembers.length}</p>
          <p style="margin: 5px 0;">Updated Members: ${updatedMembers.length}</p>
          <p style="margin: 5px 0;">New Expenses: ${newExpenses.length}</p>
          <p style="margin: 5px 0;">Updated Expenses: ${updatedExpenses.length}</p>
        </div>
      `}
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        This is an automated report from the Arizona Cricket Club management system.
        <br><strong>Excel attachment includes:</strong>
        <br>• Members tab - Complete member directory with teams
        <br>• Member Dues tabs - Dues status organized by year
        <br>• Expenses tabs - All expenses organized by year
      </p>
    </div>
  `

  try {
    const excelBuffer = generateExcelReport(allMembers, allExpenses, allMemberDues, allTeams)
    const excelBase64 = excelBuffer.toString('base64')
    
    const result = await resend.emails.send({
      from: 'Arizona Cricket Club <onboarding@resend.dev>',
      to: recipients,
      subject: `Arizona Cricket Club - ${isOnDemand ? 'On-Demand' : 'Daily'} Change Report`,
      html,
      attachments: [
        {
          filename: `arizona-cricket-club-report-${new Date().toISOString().split('T')[0]}.xlsx`,
          content: excelBase64
        }
      ]
    })
    
    console.log('Change report sent:', result.data?.id)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error('Error sending change report:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}