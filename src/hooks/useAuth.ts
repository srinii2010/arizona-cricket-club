import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuth = (requiredRole?: string) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check if user is unauthorized
    if ((session.user as { role?: string })?.role === 'unauthorized') {
      router.push('/admin/unauthorized')
      return
    }

    if (requiredRole && (session.user as { role?: string })?.role !== requiredRole) {
      router.push('/admin/unauthorized')
      return
    }
  }, [session, status, requiredRole, router])

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  }
}