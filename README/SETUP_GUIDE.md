# Arizona Cricket Club Website - Setup Guide

This comprehensive guide will walk you through setting up the Arizona Cricket Club website from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**/ **pnpm**/ **bun**
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### Required Accounts
- **Google Cloud Console** account for OAuth
- **Supabase** account for database
- **Vercel** account (for deployment)

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd acc-website
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Google OAuth Setup

#### 3.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

#### 3.2 Create OAuth Credentials
1. Navigate to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Set application type to "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy the Client ID and Client Secret

### 4. Supabase Database Setup

#### 4.1 Create Supabase Project
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Note down your project URL and anon key

#### 4.2 Database Schema Setup
Run the following SQL in your Supabase SQL editor:

```sql
-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  team_id UUID REFERENCES teams(id),
  role VARCHAR(50) DEFAULT 'member',
  join_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (for admin authentication)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  payment_status VARCHAR(20) DEFAULT 'pending',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default teams
INSERT INTO teams (name, description) VALUES
('Vipers', 'Arizona Cricket Club Vipers Team'),
('Rattlers', 'Arizona Cricket Club Rattlers Team'),
('Black Mambas', 'Arizona Cricket Club Black Mambas Team'),
('Cobras', 'Arizona Cricket Club Cobras Team');

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Enable all operations for authenticated users" ON teams FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON members FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON expenses FOR ALL USING (true);
```

### 5. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Important**: Replace all placeholder values with your actual credentials.

### 6. Test the Setup

#### 6.1 Test Database Connection
```bash
node test-supabase-connection.js
```

You should see "Supabase Connection Success!" if everything is configured correctly.

#### 6.2 Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the website.

#### 6.3 Test Admin Console
1. Go to `http://localhost:3000/admin/login`
2. Sign in with your Google account
3. You should be redirected to the admin dashboard

## 🔧 Configuration Details

### Next.js Configuration
The project uses Next.js 15 with:
- App Router (recommended)
- TypeScript support
- Turbopack for faster builds
- Tailwind CSS 4 for styling

### Authentication Flow
1. User clicks "Admin" or visits `/admin/login`
2. Redirected to Google OAuth
3. After successful authentication, redirected to `/admin`
4. Session is maintained using NextAuth.js

### Database Connection
- Uses Supabase client for all database operations
- Environment variables for secure connection
- Row Level Security (RLS) enabled for data protection

## 🚀 Deployment Setup

### Vercel Deployment

1. **Connect Repository**
   - Push your code to GitHub/GitLab
   - Connect repository to Vercel

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Update `NEXTAUTH_URL` to your production domain

3. **Deploy**
   - Vercel will automatically build and deploy
   - Update Google OAuth redirect URIs with production URL

### Production Checklist

- [ ] All environment variables set
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase RLS policies configured
- [ ] Domain configured in Vercel
- [ ] SSL certificate active
- [ ] Database backups enabled

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Missing Supabase environment variables
```
**Solution**: Check your `.env.local` file and ensure all Supabase variables are set correctly.

#### 2. Google OAuth Error
```
Error: redirect_uri_mismatch
```
**Solution**: Update the redirect URI in Google Cloud Console to match your current URL.

#### 3. NextAuth Configuration Error
```
Error: NEXTAUTH_SECRET is not set
```
**Solution**: Add `NEXTAUTH_SECRET` to your `.env.local` file.

#### 4. Build Errors
```
Error: Module not found
```
**Solution**: Run `npm install` to ensure all dependencies are installed.

### Debug Mode

Enable debug mode in `src/lib/auth.ts`:
```typescript
debug: true
```

This will provide detailed authentication logs.

## 📱 Mobile Testing

Test the responsive design:
1. Use browser developer tools
2. Test on actual mobile devices
3. Verify admin console works on mobile

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use strong, unique secrets
- Rotate secrets regularly

### Database Security
- Enable RLS policies
- Use least privilege principle
- Regular security audits

### Authentication
- Monitor login attempts
- Implement rate limiting
- Regular security updates

## 📈 Performance Optimization

### Build Optimization
- Use `npm run build` to check for build issues
- Optimize images using Next.js Image component
- Enable compression and caching

### Database Optimization
- Add indexes for frequently queried columns
- Use pagination for large datasets
- Monitor query performance

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in your terminal and browser console
2. **Verify environment variables** are set correctly
3. **Test database connection** using the test script
4. **Check Google OAuth** configuration
5. **Review this guide** for common solutions

### Support Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Setup Complete!** Your Arizona Cricket Club website should now be running successfully.
