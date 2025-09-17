# Email Notifications & Excel Export Setup Guide

This guide will help you set up the email notification system and Excel export functionality for the Arizona Cricket Club admin console.

## 📧 Email Notifications Setup

### 1. Email Service Configuration

Add the following environment variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. At the bottom, click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "Arizona Cricket Club" as the name
6. Copy the generated 16-character password
7. Use this password as `EMAIL_PASS` in your environment variables

### 3. Email Features

- **Initial Notifications**: Automatically sent when member dues are created
- **Reminder Notifications**: Manual reminders with overdue calculations
- **Professional Templates**: HTML email templates with club branding

## 📊 Excel Export Setup

### 1. Export Email Recipients Configuration

Add the following environment variables to your `.env.local` file:

```env
# Excel Export Email Recipients (comma-separated)
EXPORT_EMAIL_RECIPIENTS=admin1@example.com,admin2@example.com,treasurer@example.com

# Cron Job Security (for daily exports)
CRON_SECRET=your-secure-random-string
```

### 2. Export Features

- **Daily Automatic Exports**: Runs at 6 PM daily and sends Excel file via email
- **Manual Exports**: Available from admin dashboard, sends Excel file via email
- **Real-time Triggers**: Exports on data changes and sends via email
- **Email Attachments**: Excel files sent as email attachments
- **Three Sheets**: Members, Member Dues, General Expenses
- **Professional Email Templates**: HTML emails with export details

## 🚀 Usage

### Email Notifications

1. **Automatic**: Initial notifications are sent when creating member dues
2. **Manual**: Use the "Initial" and "Reminder" buttons in the Member Dues page
3. **Templates**: Professional HTML emails with club branding

### Excel Export

1. **Manual Export**: Click "Export Data" button in admin dashboard
2. **Automatic Export**: Runs daily at 6 PM (if cron job is set up)
3. **Real-time Export**: Triggers on any data changes
4. **Email Delivery**: Excel files are sent as email attachments to configured recipients

## 🔧 Cron Job Setup (Optional)

For daily automatic exports, set up a cron job:

```bash
# Add to your crontab (runs at 6 PM daily)
0 18 * * * curl -X GET "https://your-domain.com/api/cron/daily-export" -H "Authorization: Bearer your-cron-secret"
```

## 📁 File Structure

```
src/
├── lib/
│   ├── email.ts              # Email service and templates
│   ├── excel-export.ts       # Excel export functionality
│   └── scheduled-export.ts   # Scheduled export logic
├── app/api/
│   ├── notifications/
│   │   └── member-dues/      # Email notification API
│   ├── export/
│   │   └── daily/           # Manual export API
│   └── cron/
│       └── daily-export/    # Scheduled export API
```

## 🛠️ Troubleshooting

### Email Issues
- Verify Gmail app password is correct
- Check that 2-factor authentication is enabled
- Ensure EMAIL_USER matches the Gmail account

### Export Issues
- Verify EXPORT_EMAIL_RECIPIENTS is configured with valid email addresses
- Check that email addresses are comma-separated
- Ensure all recipients can receive email attachments
- Verify email service is working (test with member dues notifications)

### General Issues
- Check all environment variables are set
- Verify API endpoints are accessible
- Check browser console for errors

## 📞 Support

For technical support:
- Email: arizonacricketclub.acc@gmail.com
- Check the console logs for detailed error messages
- Verify all environment variables are properly configured

---

**Last Updated**: September 16, 2025  
**Version**: 1.0.0
