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
          id: token?.id || token?.sub || 'temp-id',
          role: (token as { role?: string })?.role || 'none'
        } as unknown as { id: string; name?: string | null; email?: string | null; image?: string | null; role?: string }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        
        // Fetch role immediately in JWT callback
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          
          if (supabaseUrl && serviceRoleKey) {
            const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
            const { data: userData } = await supabaseAdmin
              .from('users')
              .select('role')
              .eq('email', user.email)
              .single()
            
            token.role = userData?.role || 'none'
            console.log('JWT - Role fetched:', token.role, 'for email:', user.email)
          } else {
            token.role = 'none'
          }
        } catch (error) {
          console.error('JWT - Error fetching role:', error)
          token.role = 'none'
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