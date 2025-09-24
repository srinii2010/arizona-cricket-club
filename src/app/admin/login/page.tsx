'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      console.log('Current session:', session)
      if (session) {
        const userRole = (session.user as { role?: string })?.role
        console.log('User is logged in with role:', userRole)
        
        // Only redirect if user has a valid role
        if (userRole && ['viewer', 'editor', 'admin'].includes(userRole)) {
          console.log('User has valid role, redirecting to admin')
          router.push('/admin')
        } else {
          console.log('User has no access (role:', userRole, '), staying on login page')
        }
      } else {
        console.log('No session found')
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    console.log('Starting Google sign in...')
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/admin',
        redirect: false 
      })
      
      console.log('Sign in result:', result)
      
      if (result?.error) {
        console.error('Sign in error:', result.error)
        setError('Access denied. You are not authorized to access the admin console.')
      } else if (result?.ok) {
        console.log('Sign in successful, checking session...')
        
        // Wait longer for the session to be established
        setTimeout(async () => {
          const session = await getSession()
          console.log('Session after sign in:', session)
          
          if (session?.user?.email) {
            console.log('Session found with user data, redirecting to admin')
            router.push('/admin')
          } else {
            console.log('Session not fully established, retrying...')
            // Retry once more after another delay
            setTimeout(async () => {
              const retrySession = await getSession()
              console.log('Retry session:', retrySession)
              
              if (retrySession?.user?.email) {
                console.log('Session established on retry, redirecting to admin')
                router.push('/admin')
              } else {
                console.log('Session still not established after retry')
                setError('Sign in successful but session not established. Please try again.')
              }
            }, 1500)
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Console Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your authorized Google account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}