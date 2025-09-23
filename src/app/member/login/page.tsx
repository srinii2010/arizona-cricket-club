'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MemberLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const session = await getSession()
      if (session?.user?.email) {
        // Check if user is a member
        try {
          const res = await fetch('/api/user/profile')
          const data = await res.json()
          if (res.ok && data.member) {
            // User is a member, redirect to member dashboard
            router.push('/member')
          } else {
            // User is not a member, show error
            setError('You are not registered as a member. Please contact the admin to join ACC.')
          }
        } catch (error) {
          console.error('Error checking member status:', error)
        }
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/member'
      })
      
      if (result?.error) {
        setError('Sign in failed. Please try again.')
      } else if (result?.ok) {
        // Wait a moment for the session to be established
        setTimeout(async () => {
          try {
            const res = await fetch('/api/user/profile')
            const data = await res.json()
            if (res.ok && data.member) {
              router.push('/member')
            } else {
              setError('You are not registered as a member. Please contact the admin to join ACC.')
            }
          } catch {
            setError('Sign in successful but verification failed. Please try again.')
          }
        }, 1000)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Member Console Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access events, RSVPs, and member information
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in with Google'
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Not a member yet?{' '}
              <Link href="/join" className="font-medium text-green-600 hover:text-green-500">
                Join ACC
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <Link href="/" className="font-medium text-green-600 hover:text-green-500">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
