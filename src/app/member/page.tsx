'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<{
    teamId: string
    teamName: string
    firstName: string
    lastName: string
    role: string
    email: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/member/login')
    }
  }, [status, router])

  // Fetch user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (status !== 'authenticated') return
      
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()
        if (res.ok && data.member) {
          setUserProfile({
            teamId: data.member.teamId,
            teamName: data.member.teamName,
            firstName: data.member.firstName,
            lastName: data.member.lastName,
            role: data.member.role,
            email: data.member.email
          })
        } else {
          setError('You are not registered as a member. Please contact the admin to join ACC.')
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [status])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading member dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Link 
              href="/join" 
              className="block w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Join ACC
            </Link>
            <Link 
              href="/" 
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-green-800">
                ← Back to Home
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {userProfile?.firstName} {userProfile?.lastName}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to your Member Console
          </h1>
          <p className="text-gray-600">
            {userProfile?.teamName} • {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : ''}
          </p>
        </div>

        {/* Events & RSVPs - Main Action */}
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <Link 
            href="/member/events" 
            className="flex items-center space-x-4 group"
          >
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Events & RSVPs</h3>
              <p className="text-sm text-gray-600">View upcoming events and manage your RSVPs</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
