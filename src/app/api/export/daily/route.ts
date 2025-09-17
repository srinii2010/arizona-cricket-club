import { NextResponse } from 'next/server';
import { exportToExcel, getDailyExportData } from '@/lib/excel-export';

export async function POST() {
  try {
    // Get all data
    const data = await getDailyExportData();

    // Export to Excel and send via email
    const result = await exportToExcel(
      data.members,
      data.memberDues,
      data.generalExpenses,
      'manual'
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Export completed successfully and sent via email',
        fileName: result.fileName,
        recipients: result.recipients,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to export data', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in daily export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
