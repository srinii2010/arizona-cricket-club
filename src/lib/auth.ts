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
            const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            
            const { data: userData, error } = await supabaseAdmin
              .from('users')
              .select('role')
              .eq('email', email)
              .single()
            
            if (error || !userData) {
              console.log('User not found or error:', email, error?.message)
              // If no JWT role and no database role, set to unauthorized
              if (!userRole) {
                userRole = 'unauthorized'
                console.log('No role found, setting to unauthorized')
              }
            } else {
              // Use database role if available, otherwise keep JWT role
              if (userData.role) {
                userRole = userData.role
                console.log('User role found in database:', email, '->', userData.role)
              } else if (!userRole) {
                userRole = 'unauthorized'
                console.log('No role in database, setting to unauthorized')
              }
            }
          } catch (error) {
            console.error('Error fetching user role:', error)
            // If no JWT role and database error, set to unauthorized
            if (!userRole) {
              userRole = 'unauthorized'
              console.log('Database error, setting to unauthorized')
            }
          }
        } else if (!userRole) {
          userRole = 'unauthorized'
          console.log('No email, setting to unauthorized')
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
      }

      // Set role in JWT for middleware access
      const email = (token as { email?: string })?.email as string | undefined
      if (email && !(token as { role?: string })?.role) {
        // Only set admin role for specific email, others will be handled by session callback
        if (email === 'srinii2005@gmail.com') {
          ;(token as { role?: string }).role = 'admin'
          console.log('JWT - Set admin role for:', email)
        } else {
          // Don't set a default role - let session callback handle it from database
          console.log('JWT - No role set for:', email, '- will be handled by session callback')
        }
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