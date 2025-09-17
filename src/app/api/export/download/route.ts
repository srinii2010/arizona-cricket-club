import { NextResponse } from 'next/server';
import { getDailyExportData } from '@/lib/excel-export';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Get all data
    const data = await getDailyExportData();

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Members sheet
    const membersSheet = XLSX.utils.json_to_sheet(data.members.map((member: any) => ({
      'ID': member.id,
      'First Name': member.first_name,
      'Last Name': member.last_name,
      'Email': member.email,
      'Phone': member.phone,
      'Team Name': member.team_name,
      'Role': member.role,
      'Status': member.status,
      'Date of Birth': member.date_of_birth,
      'Gender': member.gender,
      'Created At': member.created_at,
      'Updated At': member.updated_at,
    })));

    // Member Dues sheet
    const memberDuesSheet = XLSX.utils.json_to_sheet(data.memberDues.map((due: any) => ({
      'ID': due.id,
      'Member Name': due.member_name,
      'Member Email': due.member_email,
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

    // General Expenses sheet
    const generalExpensesSheet = XLSX.utils.json_to_sheet(data.generalExpenses.map((expense: any) => ({
      'ID': expense.id,
      'Season': `${expense.year}-${expense.year + 1}`,
      'Category': expense.category,
      'Description': expense.description,
      'Amount': expense.amount,
      'Paid By Member': expense.paid_by_member,
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

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Arizona_Cricket_Club_Export_${timestamp}.xlsx`;

    // Return Excel file as download
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error in download export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
