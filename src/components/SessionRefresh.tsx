'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SessionRefresh() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      // Force session update
      await update()
      
      // Also call our refresh API
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Session refreshed:', data)
        
        // Refresh the page to ensure all components get the updated session
        router.refresh()
      } else {
        console.error('Failed to refresh session')
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!session) return null

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        Session Management
      </h3>
      <p className="text-sm text-blue-600 mb-3">
        Current role: <span className="font-medium">{(session.user as { role?: string })?.role || 'none'}</span>
      </p>
      <button
        onClick={handleRefreshSession}
        disabled={isRefreshing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
      </button>
      <p className="text-xs text-blue-500 mt-2">
        Use this if your role was recently changed but you&apos;re still seeing the old role.
      </p>
    </div>
  )
}
