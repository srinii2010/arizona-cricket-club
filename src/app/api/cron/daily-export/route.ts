import { NextRequest, NextResponse } from 'next/server';
import { runDailyExport } from '@/lib/scheduled-export';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you can add additional security here)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runDailyExport();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Daily export completed successfully and sent via email',
        fileName: result.fileName,
        recipients: result.recipients,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: 'Daily export failed', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in cron daily export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
