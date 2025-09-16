'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Plus, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { getUserPermissions, UserRole } from '@/lib/permissions'

interface Team {
  id: string
  name: string
  description?: string
}

export default function TeamsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [teams, setTeams] = useState<(Team & { member_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teams', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load teams')
      const json = await res.json()
      const teamsList: Team[] = json.teams || []
      // Fetch member counts in parallel
      const counts = await Promise.all(
        teamsList.map(async (t) => {
          const r = await fetch(`/api/members?team_id=${encodeURIComponent(t.id)}`, { cache: 'no-store' })
          if (!r.ok) return { id: t.id, count: 0 }
          const j = await r.json()
          return { id: t.id, count: (j.members || []).length }
        })
      )
      const idToCount = new Map(counts.map(c => [c.id, c.count]))
      setTeams(teamsList.map(t => ({ ...t, member_count: idToCount.get(t.id) || 0 })))
    } catch {
      setToast({ message: 'Error loading teams', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (!user) {
    return null
  }

  const userRole = (user as { role?: string })?.role as UserRole || 'viewer'
  const permissions = getUserPermissions(userRole)
  
  console.log('TeamsPage - User:', user)
  console.log('TeamsPage - User role:', userRole)
  console.log('TeamsPage - Permissions:', permissions)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             onAnimationEnd={() => setTimeout(() => setToast({ message: '', type: '' }), 2500)}>
          {toast.message}
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {permissions.canCreate && (
                <Link
                  href="/admin/teams/new"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Link>
              )}
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teams…</p>
          </div>
        )}
        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
              </div>
              
              {team.description && <p className="text-gray-600 mb-4">{team.description}</p>}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {typeof team.member_count === 'number' ? `${team.member_count} members` : '—'}
                </div>
                <Link
                  href={`/admin/teams/${team.id}/members`}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Members →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}