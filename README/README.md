# Arizona Cricket Club Website

A modern, responsive website for the Arizona Cricket Club (ACC) built with Next.js 15, featuring a public-facing website and an admin console for club management.

## 🏏 About Arizona Cricket Club

The Arizona Cricket Club was established in August 2003 to promote the game of Cricket in Arizona. We are the only team in Arizona with our own ground and play on natural turf wicket. The club consists of four teams: Vipers, Rattlers, Black Mambas, and Cobras.

## ✨ Features

### Public Website
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Club Information**: Comprehensive information about the club's history and philosophy
- **Team Showcase**: Information about all four teams
- **Ground Information**: Details about the home ground at Nichols Park Basin in Gilbert
- **Sponsor Information**: Showcase of club sponsors
- **Join Application**: Call-to-action for new members

### Admin Console
- **Authentication**: Google OAuth integration with NextAuth.js
- **Role-based Access**: Admin and user role management
- **Member Management**: Add, edit, and manage club members
- **Expense Management**: Track yearly dues and expenses
- **Team Management**: Manage teams and team assignments
- **User Management**: Control access permissions and roles

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
acc-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin console pages
│   │   │   ├── expenses/      # Expense management
│   │   │   ├── login/         # Admin login
│   │   │   ├── members/       # Member management
│   │   │   ├── teams/         # Team management
│   │   │   ├── unauthorized/  # Unauthorized access page
│   │   │   └── users/         # User management
│   │   ├── api/               # API routes
│   │   │   └── auth/          # NextAuth.js API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Context providers
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   └── lib/                   # Utility libraries
│       └── auth.ts            # NextAuth configuration
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── next.config.ts            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Google OAuth credentials
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd acc-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Database Setup**
   
   Set up your Supabase database with the required tables:
   - `teams` - Store team information
   - `members` - Store member information
   - `users` - Store user authentication data
   - `expenses` - Store expense records

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the website.

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🌐 Deployment

The application is ready for deployment on Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy!

## 📱 Pages and Routes

### Public Routes
- `/` - Home page with club information
- `/join` - New member application (to be implemented)

### Admin Routes
- `/admin/login` - Admin login page
- `/admin` - Admin dashboard
- `/admin/members` - Member management
- `/admin/expenses` - Expense management
- `/admin/teams` - Team management
- `/admin/users` - User management
- `/admin/unauthorized` - Unauthorized access page

## 🔐 Authentication

The admin console uses Google OAuth for authentication. Users can sign in with their Google accounts and are automatically assigned admin roles (currently all users get admin access).

## 🎨 Styling

The project uses Tailwind CSS 4 for styling with:
- Custom color scheme matching the club branding
- Responsive design patterns
- Custom fonts (Dancing Script for headings)
- Modern UI components

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following key tables:
- **teams**: Team information and details
- **members**: Club member information
- **users**: User authentication and roles
- **expenses**: Financial tracking and dues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary to the Arizona Cricket Club.

## 📞 Contact

For questions or support, contact:
- Email: arizonacricketclub.acc@gmail.com
- Website: [Arizona Cricket Club](http://localhost:3000)

## 🙏 Acknowledgments

- Built with Next.js and Vercel
- Styled with Tailwind CSS
- Icons by Lucide React
- Authentication by NextAuth.js
- Database by Supabase

---

**Arizona Cricket Club** - Home of Vipers, Rattlers, Black Mambas & Cobras