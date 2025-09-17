// Simple test to check the refresh token
require('dotenv').config({ path: '.env.local' });

console.log('Refresh token length:', process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.length : 0);
console.log('Refresh token starts with:', process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.substring(0, 20) : 'Not set');
console.log('Refresh token ends with:', process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.substring(process.env.GOOGLE_REFRESH_TOKEN.length - 20) : 'Not set');

// Expected: Should start with "1//04" and be around 100+ characters long
const expectedStart = "1//04";
const actualStart = process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.substring(0, 5) : "";

console.log('Expected start:', expectedStart);
console.log('Actual start:', actualStart);
console.log('Token looks correct:', actualStart === expectedStart && process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_REFRESH_TOKEN.length > 100);
