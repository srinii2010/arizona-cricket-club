'use client'

import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AdminGuardProps {
  children: React.ReactNode
  requiredRole?: 'viewer' | 'editor' | 'admin'
}

export default function AdminGuard({ children, requiredRole = 'viewer' }: AdminGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Force session refresh to bypass Vercel caching
  useEffect(() => {
    const refreshSession = async () => {
      await getSession({ event: 'storage' })
    }
    refreshSession()
  }, [])

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (status === 'authenticated') {
      // Only proceed if we have a complete session with role
      if (!session?.user?.email) {
        return
      }

      const userRole = (session.user as { role?: string })?.role
      
      // Wait for role to be available (not undefined, not null, not empty)
      if (!userRole || userRole === 'none') {
        return
      }
      
      // Check if user has required role
      const roleHierarchy = { viewer: 1, editor: 2, admin: 3 }
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      if (userLevel >= requiredLevel) {
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        router.push('/admin/unauthorized')
      }
    }
  }, [session, status, requiredRole, router])

  if (isLoading) {
    let loadingMessage = "Loading..."
    
    if (status === 'loading') {
      loadingMessage = "Connecting to Google..."
    } else if (status === 'authenticated' && !session?.user?.email) {
      loadingMessage = "Verifying your account..."
    } else if (status === 'authenticated' && session?.user?.email && !(session.user as { role?: string })?.role) {
      loadingMessage = "Loading your admin permissions..."
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
