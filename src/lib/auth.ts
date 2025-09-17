import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes - shorter session for fresh role checks
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user = {
          ...session.user,
          id: token?.id || token?.sub || 'temp-id'
        } as unknown as { id: string; name?: string | null; email?: string | null; image?: string | null }
        
        // Start with JWT role if available
        let userRole = (token as { role?: string })?.role
        console.log('Session - Starting with JWT role:', userRole, 'for email:', session.user.email)
        
        // Try to get role from database
        const email = session.user.email
        if (email) {
          try {
            // Create Supabase client with service role key for server-side access
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            
            if (!supabaseUrl || !serviceRoleKey) {
              console.warn('Supabase environment variables not configured for auth')
              // Set to 'none' when Supabase is not configured
              userRole = 'none'
              console.log('Setting role to none due to missing Supabase config')
            } else {
              const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
              
              const { data: userData, error } = await supabaseAdmin
                .from('users')
                .select('role')
                .eq('email', email)
                .single()
              
              if (error || !userData) {
                console.log('User not found in database:', email, error?.message)
                // If no database record, set to 'none' (no access)
                userRole = 'none'
                console.log('No database record, setting role to none')
              } else {
                // Use database role
                userRole = userData.role || 'none'
                console.log('User role found in database:', email, '->', userRole)
              }
            }
          } catch (error) {
            console.error('Error fetching user role from database:', error)
            // On error, set to 'none' for security
            userRole = 'none'
            console.log('Database error, setting role to none')
          }
        } else if (!userRole) {
          userRole = 'none'
          console.log('No email, setting role to none')
        }
        
        session.user = {
          ...session.user,
          role: userRole
        } as unknown as { id: string; name?: string | null; email?: string | null; image?: string | null; role: string }
        
        // Update token with the final role for middleware access
        if (token) {
          (token as { role?: string }).role = userRole
        }
      }
      return session
    },
    async jwt({ token, user }) {
      // Ensure token has stable identifiers
      if (user) {
        token.id = user.id
        token.email = user.email
        // Don't set role in JWT - always fetch fresh from database in session callback
        console.log('JWT - User signed in:', user.email, '- role will be fetched from database')
      }
      return token
    },
    async signIn() {
      // Allow all users to sign in, but check authorization in session callback
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      
      // If URL is provided, use it (this respects callbackUrl from signOut)
      if (url) {
        return url
      }
      
      // Default to admin for login
      return `${baseUrl}/admin`
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  debug: true
}