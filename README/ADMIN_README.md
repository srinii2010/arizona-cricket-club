# Arizona Cricket Club - Admin Console Documentation

This document provides detailed information about the admin console functionality for the Arizona Cricket Club website.

## 🔐 Admin Console Overview

The admin console is a comprehensive management system that allows authorized users to manage all aspects of the cricket club, including members, teams, expenses, and user access.

## 🚀 Accessing the Admin Console

1. Navigate to `/admin/login` on the website
2. Sign in with your Google account
3. You'll be redirected to the admin dashboard at `/admin`

## 📊 Dashboard Features

The admin dashboard provides quick access to all management functions:

### Member Management (`/admin/members`)
- **Add New Members**: Create new club member profiles
- **Edit Member Information**: Update existing member details
- **Assign Teams**: Assign members to specific teams (Vipers, Rattlers, Black Mambas, Cobras)
- **Manage Roles**: Set member roles and permissions
- **View Member List**: Browse and search through all members

### Expense Management (`/admin/expenses`)
- **Track Yearly Dues**: Monitor member payment status
- **Record Expenses**: Log club expenses and transactions
- **Payment History**: View payment records and outstanding balances
- **Financial Reports**: Generate expense and revenue reports
- **Dues Management**: Track and manage annual membership fees

### Team Management (`/admin/teams`)
- **Team Information**: Manage team details and descriptions
- **Team Assignments**: Assign members to teams
- **Team Statistics**: Track team performance and records
- **Team Schedules**: Manage team-specific events and matches

### User Management (`/admin/users`)
- **Add Users**: Create new admin and user accounts
- **Role Management**: Assign and modify user roles
- **Access Control**: Manage permissions and access levels
- **User Activity**: Monitor user login and activity logs

## 🔧 Technical Implementation

### Authentication System
- **Provider**: Google OAuth via NextAuth.js
- **Session Management**: Server-side session handling
- **Role-based Access**: Admin and user role differentiation
- **Security**: Automatic redirects for unauthorized access

### Database Integration
- **Database**: Supabase (PostgreSQL)
- **Tables**: teams, members, users, expenses
- **Real-time Updates**: Live data synchronization
- **Data Validation**: Zod schema validation

### Key Components

#### `useAuth` Hook
```typescript
const { user, isLoading, isAuthenticated } = useAuth('admin')
```
- Handles authentication state
- Manages role-based access control
- Provides loading states and user information

#### Admin Pages Structure
```
/admin/
├── page.tsx              # Main dashboard
├── login/page.tsx        # Login page
├── members/page.tsx      # Member management
├── expenses/page.tsx     # Expense management
├── teams/page.tsx        # Team management
├── users/page.tsx        # User management
└── unauthorized/page.tsx # Access denied page
```

## 🛠️ Development Guidelines

### Adding New Admin Features

1. **Create the page component** in the appropriate `/admin/` subdirectory
2. **Implement authentication** using the `useAuth` hook
3. **Add navigation** to the main dashboard
4. **Create API routes** if needed in `/api/`
5. **Update database schema** if new data structures are required

### Authentication Requirements

All admin pages must:
- Use the `useAuth('admin')` hook
- Handle loading states appropriately
- Redirect unauthorized users
- Display proper error messages

### Database Operations

- Use Supabase client for all database operations
- Implement proper error handling
- Validate data using Zod schemas
- Handle loading and error states in UI

## 🔒 Security Considerations

### Access Control
- All admin routes are protected by authentication
- Role-based access prevents unauthorized actions
- Session management ensures secure access

### Data Protection
- Input validation prevents malicious data
- SQL injection protection via Supabase
- Secure environment variable handling

### User Management
- Google OAuth provides secure authentication
- Role assignments are controlled by admin users
- Session timeouts for security

## 📱 Responsive Design

The admin console is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

All admin functions are accessible on mobile devices with touch-friendly interfaces.

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Check Google OAuth credentials in environment variables
   - Verify NextAuth configuration
   - Clear browser cache and cookies

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Review Supabase project status

3. **Permission Errors**
   - Ensure user has admin role
   - Check role assignment in database
   - Verify authentication status

### Debug Mode

Enable debug mode in `lib/auth.ts`:
```typescript
debug: true
```

This will provide detailed logging for authentication issues.

## 📈 Future Enhancements

### Planned Features
- **Advanced Reporting**: Detailed analytics and reports
- **Email Notifications**: Automated member communications
- **File Uploads**: Member photo and document management
- **Calendar Integration**: Match and event scheduling
- **Mobile App**: Native mobile admin application

### Integration Opportunities
- **Payment Processing**: Stripe integration for dues collection
- **Email Marketing**: Newsletter and communication tools
- **Social Media**: Automated social media posting
- **Analytics**: Google Analytics integration

## 📞 Support

For technical support or questions about the admin console:

- **Email**: arizonacricketclub.acc@gmail.com
- **Documentation**: This README and inline code comments
- **Issues**: Report bugs through the project repository

## 🔄 Maintenance

### Regular Tasks
- Monitor user access and permissions
- Review and update member information
- Process expense reports and payments
- Update team assignments as needed
- Backup database regularly

### Security Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Review access logs regularly
- Update authentication settings as needed

---

**Admin Console** - Arizona Cricket Club Management System
