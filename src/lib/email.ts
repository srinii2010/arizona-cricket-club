import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export async function sendEmail({ to, subject, html, text, attachments }: EmailData) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Email subject:', subject);
    console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');

    const emailData = {
      from: 'Arizona Cricket Club <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    } as {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text?: string;
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
      }>;
    };

    // Add text version if provided
    if (text) {
      emailData.text = text;
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      }));
    }

    const result = await resend.emails.send(emailData);
    console.log('Email sent successfully:', result.data?.id);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Email templates
export function generateMemberDuesNotificationEmail(memberName: string, duesAmount: number, dueDate: string, season: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .due-date { color: #dc2626; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Arizona Cricket Club</h1>
          <h2>Member Dues Notification</h2>
        </div>
        <div class="content">
          <p>Dear ${memberName},</p>
          
          <p>This is to inform you that your member dues for the <strong>${season}</strong> season have been created.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <h3>Dues Details:</h3>
            <p><strong>Amount Due:</strong> <span class="amount">$${duesAmount.toFixed(2)}</span></p>
            <p><strong>Due Date:</strong> <span class="due-date">${new Date(dueDate).toLocaleDateString()}</span></p>
            <p><strong>Season:</strong> ${season}</p>
          </div>
          
          <p>Please make the payment. If you have any questions, please contact the club administration.</p>
          
          <div class="footer">
            <p><strong>Arizona Cricket Club</strong><br>
            Email: arizonacricketclub.acc@gmail.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Arizona Cricket Club - Member Dues for ${season}`,
    html,
  };
}

export function generateMemberDuesReminderEmail(memberName: string, duesAmount: number, dueDate: string, season: string, daysOverdue?: number) {
  const isOverdue = daysOverdue && daysOverdue > 0;
  const urgencyText = isOverdue 
    ? `This payment is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.`
    : 'This is a friendly reminder about your upcoming payment.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${isOverdue ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .due-date { color: ${isOverdue ? '#dc2626' : '#f59e0b'}; font-weight: bold; }
        .urgent { background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Arizona Cricket Club</h1>
          <h2>${isOverdue ? 'Overdue Payment Reminder' : 'Payment Reminder'}</h2>
        </div>
        <div class="content">
          <p>Dear ${memberName},</p>
          
          <p>${urgencyText}</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isOverdue ? '#dc2626' : '#f59e0b'};">
            <h3>Dues Details:</h3>
            <p><strong>Amount Due:</strong> <span class="amount">$${duesAmount.toFixed(2)}</span></p>
            <p><strong>Due Date:</strong> <span class="due-date">${new Date(dueDate).toLocaleDateString()}</span></p>
            <p><strong>Season:</strong> ${season}</p>
          </div>
          
          ${isOverdue ? `
            <div class="urgent">
              <p><strong>⚠️ URGENT:</strong> This payment is overdue. Please make payment as soon as possible to avoid any service interruptions.</p>
            </div>
          ` : ''}
          
          <p>Please make the payment. If you have any questions, please contact the club administration.</p>
          
          <div class="footer">
            <p><strong>Arizona Cricket Club</strong><br>
            Email: arizonacricketclub.acc@gmail.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Arizona Cricket Club - ${isOverdue ? 'Overdue' : 'Payment'} Reminder for ${season}`,
    html,
  };
}

export function generateExcelExportEmail(exportType: 'manual' | 'daily' | 'data_change', changeType?: string) {
  const isDaily = exportType === 'daily';
  const isDataChange = exportType === 'data_change';
  
  const title = isDaily ? 'Daily Data Export' : isDataChange ? 'Data Change Export' : 'Manual Data Export';
  const description = isDaily 
    ? 'This is your daily automated export of all Arizona Cricket Club data.'
    : isDataChange 
    ? `This export was triggered by a change in ${changeType} data.`
    : 'This is a manual export of all Arizona Cricket Club data.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .attachment-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        .highlight { background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Arizona Cricket Club</h1>
          <h2>${title}</h2>
        </div>
        <div class="content">
          <p>Dear Administrator,</p>
          
          <p>${description}</p>
          
          <div class="attachment-info">
            <h3>📊 Excel Export Attached</h3>
            <p>The attached Excel file contains the following data:</p>
            <ul>
              <li><strong>Members Sheet:</strong> All club member information</li>
              <li><strong>Member Dues Sheet:</strong> All member dues and payment status</li>
              <li><strong>General Expenses Sheet:</strong> All club expenses and settlements</li>
            </ul>
          </div>
          
          <div class="highlight">
            <p><strong>📅 Export Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>📁 File Format:</strong> Microsoft Excel (.xlsx)</p>
            <p><strong>🔒 Data Security:</strong> This file contains sensitive member information. Please handle with care.</p>
          </div>
          
          <p>If you have any questions about this export or need assistance, please contact the system administrator.</p>
          
          <div class="footer">
            <p><strong>Arizona Cricket Club</strong><br>
            Email: arizonacricketclub.acc@gmail.com</p>
            <p><em>This is an automated message from the Arizona Cricket Club Admin System.</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Arizona Cricket Club - ${title}`,
    html,
  };
}
