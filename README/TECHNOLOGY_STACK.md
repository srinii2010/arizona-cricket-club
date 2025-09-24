# Arizona Cricket Club - Technology Stack

## 🛠️ **Technology Stack Summary**

### **Frontend Framework**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### **Backend & Database**
- **Supabase** - PostgreSQL database + Authentication
- **NextAuth.js** - Authentication with Google Provider
- **API Routes** - Next.js API routes for backend logic

### **Authentication & Authorization**
- **Google OAuth** - Social login via NextAuth.js
- **Role-Based Access Control (RBAC)** - Admin, Editor, Viewer roles
- **Member Authentication** - Simple member verification (no RBAC)

### **Deployment & Hosting**
- **Vercel** - Frontend hosting and deployment
- **Vercel Cron Jobs** - Scheduled tasks
- **Git** - Version control

### **Development Tools**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Node.js** - Runtime environment

### **Key Features Implemented**
- **Progressive Web App (PWA)** - Service worker, manifest.json
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live RSVP management
- **File Management** - Image uploads and processing
- **Email Notifications** - Automated notifications
- **Data Export** - CSV exports for reports

### **Architecture**
- **Server-Side Rendering (SSR)** - Next.js App Router
- **Client-Side State Management** - React hooks and context
- **Database Relations** - Complex relationships between teams, seasons, events, members
- **API-First Design** - RESTful API endpoints

## 📁 **Project Structure**

```
src/
├── app/
│   ├── admin/                 # Admin Console (RBAC protected)
│   │   ├── access/           # User access management
│   │   ├── events/           # Event management
│   │   ├── members/          # Member management
│   │   ├── schedule/         # Schedule management
│   │   ├── seasons/          # Season management
│   │   ├── teams/            # Team management
│   │   └── expenses/         # Expense management
│   ├── member/               # Member Console (new)
│   │   ├── login/           # Member login page
│   │   ├── events/          # Member events & RSVPs
│   │   └── page.tsx         # Member dashboard
│   ├── api/                 # API routes
│   │   ├── events/          # Event management APIs
│   │   ├── members/         # Member management APIs
│   │   ├── teams/           # Team management APIs
│   │   ├── seasons/         # Season management APIs
│   │   ├── notifications/   # Notification APIs
│   │   └── user/            # User profile APIs
│   └── page.tsx             # Main website homepage
├── components/              # Reusable components
├── lib/                     # Utility libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Helper functions
└── types/                   # TypeScript type definitions
```

## 🔐 **Authentication Flow**

### **Admin Console**
1. User clicks "Admin Console" → `/admin/login`
2. Google OAuth authentication
3. Check user role in `users` table (admin, editor, viewer)
4. Redirect to admin dashboard with RBAC permissions

### **Member Console**
1. User clicks "Member Console" → `/member/login`
2. Google OAuth authentication
3. Check if user exists in `members` table
4. Redirect to member dashboard (no RBAC)

## 🗄️ **Database Schema**

### **Core Tables**
- **`users`** - Admin console users with RBAC roles
- **`members`** - Club members (team assignments)
- **`teams`** - Cricket teams
- **`seasons`** - Tournament seasons
- **`tournament_formats`** - Game formats (T20, T40, etc.)
- **`events`** - Matches and practices
- **`rsvps`** - Member attendance responses
- **`notifications`** - System notifications

### **Key Relationships**
- Members belong to Teams
- Events belong to Teams and Tournament Formats
- Tournament Formats belong to Seasons
- RSVPs link Members to Events

## 🚀 **Recent Updates**

### **Member Console Implementation**
- ✅ Added Member Console tab to main navigation
- ✅ Created `/member` route structure with login and dashboard
- ✅ Moved events functionality to `/member/events` with green theme
- ✅ Added member authentication (no RBAC, just members table check)
- ✅ Created member event details page with RSVP management
- ✅ Preserved season/format selections in navigation
- ✅ Fixed seasons dropdown by using correct API data structure
- ✅ Updated original `/events` pages to redirect to member console
- ✅ Archived old events pages to `scripts/archive/`

## 🔧 **Development Commands**

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

## 📱 **Features**

### **Admin Console**
- User access management with RBAC
- Event creation and management
- Member management
- Team and season management
- Schedule management
- Expense tracking
- Notification management

### **Member Console**
- View upcoming events
- Manage RSVPs (Yes/No/Maybe)
- Team-based event filtering
- Season and format selection
- Clean, member-focused interface

### **Main Website**
- Public information about the club
- Navigation to Admin and Member consoles
- Responsive design for all devices

## 🌐 **Deployment**

- **Frontend**: Vercel (automatic deployments from Git)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth via NextAuth.js
- **File Storage**: Supabase Storage
- **Cron Jobs**: Vercel Cron for scheduled tasks

---

*This is a modern, full-stack web application built with cutting-edge technologies for comprehensive cricket club management! 🏏*
