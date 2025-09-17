// Test script to test Gmail API directly
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

console.log('Testing Gmail API directly...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'Set' : 'Not set');

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function testGmailAPI() {
  try {
    console.log('\n1. Getting access token...');
    const { token } = await oauth2Client.getAccessToken();
    console.log('✅ Access token obtained');
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');

    console.log('\n2. Creating Gmail API client...');
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    console.log('\n3. Testing Gmail API access...');
    const profile = await gmail.users.getProfile({ userId: 'me' });
    console.log('✅ Gmail API access successful');
    console.log('Email address:', profile.data.emailAddress);
    console.log('Messages total:', profile.data.messagesTotal);

    console.log('\n4. Testing Gmail send scope...');
    // Create a test message
    const message = {
      raw: Buffer.from(
        `To: ${process.env.EMAIL_USER}\r\n` +
        `Subject: Test Email from Gmail API\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        `<h1>Test Email</h1><p>This is a test email sent directly via Gmail API.</p>`
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    };

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: message
    });

    console.log('✅ Email sent successfully via Gmail API');
    console.log('Message ID:', result.data.id);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.errors);
    
    if (error.code === 403) {
      console.log('\n🔍 This might be a scope issue. Make sure you have:');
      console.log('- Gmail API enabled in your project');
      console.log('- OAuth2 scope: https://www.googleapis.com/auth/gmail.send');
    }
  }
}

testGmailAPI();
