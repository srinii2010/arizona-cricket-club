'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

interface MemberRow {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
}

export default function TeamMembersPage() {
  const { data: session } = useSession()
  const user = session?.user
  const params = useParams<{ id: string }>()
  const teamId = params?.id

  const [teamName, setTeamName] = useState<string>('Team')
  const [rows, setRows] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [teamRes, memRes] = await Promise.all([
        fetch('/api/teams', { cache: 'no-store' }),
        fetch(`/api/members?team_id=${encodeURIComponent(String(teamId))}`, { cache: 'no-store' })
      ])
      if (teamRes.ok) {
        const tj = await teamRes.json()
        const found = (tj.teams || []).find((t: { id: string; name?: string }) => t.id === teamId)
        if (found?.name) setTeamName(found.name)
      }
      if (memRes.ok) {
        const mj = await memRes.json()
        setRows(mj.members || [])
      }
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    if (!teamId) return
    load()
  }, [teamId, load])

  if (!user) {
    return null;
  }


  if (loading) {
    return (
      <AdminGuard requiredRole="viewer">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard requiredRole="viewer">
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">{teamName} Members</h1>
            <Link href="/admin/teams" className="text-gray-600 hover:text-blue-600">← Back to Teams</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading team members…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">No members in this team</h3>
            <p className="text-sm text-blue-800">Add members to this team from Member Management.</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Members ({rows.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{m.first_name} {m.last_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{m.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{m.phone}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{String(m.role).replace('_',' ').toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
    </AdminGuard>
  )
}


