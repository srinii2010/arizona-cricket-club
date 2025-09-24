'use client'

import { useSession } from 'next-auth/react'
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

  useEffect(() => {
    console.log('AdminGuard - Session changed:', { 
      status, 
      hasUser: !!session?.user, 
      hasEmail: !!session?.user?.email,
      hasRole: !!(session?.user as { role?: string })?.role,
      role: (session?.user as { role?: string })?.role
    })
    
    if (status === 'loading') {
      console.log('AdminGuard - Still loading...')
      return // Still loading
    }

    if (status === 'unauthenticated') {
      console.log('AdminGuard - Unauthenticated, redirecting to login')
      router.push('/admin/login')
      return
    }

    if (status === 'authenticated') {
      // Only proceed if we have a complete session with role
      if (!session?.user?.email) {
        console.log('AdminGuard - Session authenticated but user data not ready yet')
        return
      }

      const userRole = (session.user as { role?: string })?.role
      console.log('AdminGuard - User role:', userRole, 'Required role:', requiredRole)
      
      // Wait for role to be available (not undefined, not null, not empty)
      if (!userRole || userRole === 'none') {
        console.log('AdminGuard - Session authenticated but role data not ready yet (role:', userRole, ')')
        return
      }
      
      // Check if user has required role
      const roleHierarchy = { viewer: 1, editor: 2, admin: 3 }
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      console.log('AdminGuard - User level:', userLevel, 'Required level:', requiredLevel)

      if (userLevel >= requiredLevel) {
        console.log('AdminGuard - User authorized!')
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        console.log('AdminGuard - User not authorized, redirecting to unauthorized')
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
