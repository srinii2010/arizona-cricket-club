import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateMemberDuesNotificationEmail, generateMemberDuesReminderEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, memberEmail, memberName, duesAmount, dueDate, season, daysOverdue } = await request.json();

    if (!memberEmail || !memberName || !duesAmount || !dueDate || !season) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let emailData;
    
    if (type === 'initial') {
      emailData = generateMemberDuesNotificationEmail(memberName, duesAmount, dueDate, season);
    } else if (type === 'reminder') {
      emailData = generateMemberDuesReminderEmail(memberName, duesAmount, dueDate, season, daysOverdue);
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: memberEmail,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending member dues notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
