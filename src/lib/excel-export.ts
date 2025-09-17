import * as XLSX from 'xlsx';
import { sendEmail, generateExcelExportEmail, EmailAttachment } from './email';

export interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  team_name: string;
  role: string;
  status: string;
  date_of_birth: string;
  gender: string;
  created_at: string;
  updated_at: string;
}

export interface MemberDueData {
  id: string;
  member_name: string;
  member_email: string;
  year: number;
  season_dues: number;
  extra_jersey_dues: number;
  extra_trouser_dues: number;
  credit_adjustment: number;
  total_dues: number;
  due_date: string;
  payment_status: string;
  settlement_date: string;
  comments: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralExpenseData {
  id: string;
  year: number;
  category: string;
  description: string;
  amount: number;
  paid_by_member: string;
  paid_by_email: string;
  tournament_format: string;
  settlement_status: string;
  settlement_date: string;
  comments: string;
  created_at: string;
  updated_at: string;
}

export async function exportToExcel(
  members: MemberData[],
  memberDues: MemberDueData[],
  generalExpenses: GeneralExpenseData[],
  exportType: 'manual' | 'daily' | 'data_change' = 'manual',
  changeType?: string
) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create Members sheet
    const membersSheet = XLSX.utils.json_to_sheet(members.map(member => ({
      'Member ID': member.id,
      'First Name': member.first_name,
      'Last Name': member.last_name,
      'Email': member.email,
      'Phone': member.phone,
      'Team': member.team_name,
      'Role': member.role,
      'Status': member.status,
      'Date of Birth': member.date_of_birth,
      'Gender': member.gender,
      'Created At': member.created_at,
      'Updated At': member.updated_at,
    })));

    // Create Member Dues sheet
    const memberDuesSheet = XLSX.utils.json_to_sheet(memberDues.map(due => ({
      'Due ID': due.id,
      'Member Name': due.member_name,
      'Member Email': due.member_email,
      'Year': due.year,
      'Season': `${due.year}-${due.year + 1}`,
      'Season Dues': due.season_dues,
      'Extra Jersey Dues': due.extra_jersey_dues,
      'Extra Trouser Dues': due.extra_trouser_dues,
      'Credit Adjustment': due.credit_adjustment,
      'Total Dues': due.total_dues,
      'Due Date': due.due_date,
      'Payment Status': due.payment_status,
      'Settlement Date': due.settlement_date,
      'Comments': due.comments,
      'Created At': due.created_at,
      'Updated At': due.updated_at,
    })));

    // Create General Expenses sheet
    const generalExpensesSheet = XLSX.utils.json_to_sheet(generalExpenses.map(expense => ({
      'Expense ID': expense.id,
      'Year': expense.year,
      'Season': `${expense.year}-${expense.year + 1}`,
      'Category': expense.category,
      'Description': expense.description,
      'Amount': expense.amount,
      'Paid By': expense.paid_by_member,
      'Paid By Email': expense.paid_by_email,
      'Tournament Format': expense.tournament_format,
      'Settlement Status': expense.settlement_status,
      'Settlement Date': expense.settlement_date,
      'Comments': expense.comments,
      'Created At': expense.created_at,
      'Updated At': expense.updated_at,
    })));

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members');
    XLSX.utils.book_append_sheet(workbook, memberDuesSheet, 'Member Dues');
    XLSX.utils.book_append_sheet(workbook, generalExpensesSheet, 'General Expenses');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `ACC_Data_Export_${dateStr}_${timeStr}.xlsx`;

    // Get export email recipients from environment variables
    const exportEmails = process.env.EXPORT_EMAIL_RECIPIENTS?.split(',').map(email => email.trim()) || [];
    
    if (exportEmails.length === 0) {
      return {
        success: false,
        error: 'No export email recipients configured',
      };
    }

    // Generate email content
    const emailData = generateExcelExportEmail(exportType, changeType);
    
    // Create email attachment
    const attachment: EmailAttachment = {
      filename: filename,
      content: excelBuffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    // Send email with Excel attachment
    const emailResult = await sendEmail({
      to: exportEmails,
      subject: emailData.subject,
      html: emailData.html,
      attachments: [attachment],
    });

    if (emailResult.success) {
      return {
        success: true,
        fileName: filename,
        recipients: exportEmails,
        messageId: emailResult.messageId,
      };
    } else {
      return {
        success: false,
        error: emailResult.error,
      };
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getDailyExportData() {
  try {
    // Fetch all data from your APIs
    const [membersRes, memberDuesRes, generalExpensesRes] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/members`),
      fetch(`${process.env.NEXTAUTH_URL}/api/member-dues`),
      fetch(`${process.env.NEXTAUTH_URL}/api/general-expenses`),
    ]);

    const [membersData, memberDuesData, generalExpensesData] = await Promise.all([
      membersRes.json(),
      memberDuesRes.json(),
      generalExpensesRes.json(),
    ]);

    // Transform member dues data to include member information
    const transformedMemberDues = (memberDuesData.dues || []).map((due: any) => ({
      ...due,
      member_name: due.members ? `${due.members.first_name} ${due.members.last_name}` : '',
      member_email: due.members ? due.members.email : '',
    }));

    // Transform general expenses data to include member information
    const transformedGeneralExpenses = (generalExpensesData.expenses || []).map((expense: any) => ({
      ...expense,
      paid_by_member: expense.members ? `${expense.members.first_name} ${expense.members.last_name}` : '',
      paid_by_email: expense.members ? expense.members.email : '',
      tournament_format: expense.tournament_formats ? expense.tournament_formats.name : '',
    }));

    return {
      members: membersData.members || [],
      memberDues: transformedMemberDues,
      generalExpenses: transformedGeneralExpenses,
    };
  } catch (error) {
    console.error('Error fetching data for export:', error);
    throw error;
  }
}
