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
    if (status === 'loading') return // Still loading

    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (session?.user) {
      const userRole = (session.user as { role?: string })?.role
      console.log('AdminGuard - User role:', userRole, 'Required role:', requiredRole)
      
      // Check if user has required role
      const roleHierarchy = { viewer: 1, editor: 2, admin: 3 }
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      console.log('AdminGuard - User level:', userLevel, 'Required level:', requiredLevel)

      if (userLevel >= requiredLevel) {
        console.log('AdminGuard - User authorized')
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        console.log('AdminGuard - User not authorized, redirecting to unauthorized')
        router.push('/admin/unauthorized')
      }
    } else {
      setIsLoading(false)
    }
  }, [session, status, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
