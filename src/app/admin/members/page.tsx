'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase' // Temporarily disabled
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'
import { getUserPermissions, UserRole } from '@/lib/permissions'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  team_id: string
  role: string
  date_of_birth?: string
  gender?: string
  teams?: {
    name: string
  }
}

interface Team {
  id: string
  name: string
}

export default function MembersPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teamsRes, membersRes] = await Promise.all([
        fetch('/api/teams', { cache: 'no-store' }),
        fetch('/api/members', { cache: 'no-store' })
      ])

      if (!teamsRes.ok) throw new Error('Failed to load teams')
      if (!membersRes.ok) throw new Error('Failed to load members')

      const teamsJson = await teamsRes.json()
      const membersJson = await membersRes.json()

      setTeams(teamsJson.teams ?? [])
      setMembers(membersJson.members ?? [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setToast({ message: 'Error loading members. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || 'Failed to delete member')
      }
      // refresh list from server
      await fetchData()
      setToast({ message: 'Member deleted successfully', type: 'success' })
    } catch (error) {
      console.error('Error deleting member:', error)
      setToast({ message: 'Error deleting member', type: 'error' })
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    
    const matchesTeam = !filterTeam || member.team_id === filterTeam
    const matchesRole = !filterRole || member.role === filterRole

    return matchesSearch && matchesTeam && matchesRole
  })

  if (!user) {
    return null
  }

  const permissions = getUserPermissions(((user as { role?: string })?.role as UserRole) || 'viewer')

  return (
    <AdminGuard requiredRole="viewer">
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
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
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {permissions.canCreate && (
                <Link
                  href="/admin/members/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
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
            <p className="mt-4 text-gray-600">Loading members…</p>
          </div>
        )}
        {/* Filters */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Members
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Team
              </label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="member">Member</option>
                <option value="coach">Coach</option>
                <option value="manager">Manager</option>
                <option value="captain">Captain</option>
                <option value="vice_captain">Vice Captain</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterTeam('')
                  setFilterRole('')
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Info/Empty State */}
        {!loading && members.length === 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">No members found</h3>
            <p className="text-sm text-blue-800">Get started by adding your first member.</p>
            <div className="mt-3">
              <Link
                href="/admin/members/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Member
              </Link>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              All Members ({filteredMembers.length} of {members.length})
            </h2>
          </div>
          
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {members.length === 0 ? 'No members found' : 'No members match your filters'}
              </h3>
              <p className="text-gray-600 mb-4">
                {members.length === 0 
                  ? 'Get started by adding your first member.' 
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {members.length === 0 && (
                <Link
                  href="/admin/members/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Member
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.first_name} {member.last_name}
                        </div>
                        {member.date_of_birth && (
                          <div className="text-xs text-gray-500">
                            DOB: {new Date(member.date_of_birth).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {member.teams?.name || 'No Team'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {member.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.created_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.last_updated_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {permissions.canEdit && (
                            <Link
                              href={`/admin/members/${member.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit member"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {permissions.canDelete && (
                            <button
                              onClick={() => deleteMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
    </AdminGuard>
  )
}