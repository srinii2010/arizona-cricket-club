'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { Settings, User, Shield, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

export default function UsersPage() {
  const { isLoading } = useAuth('admin')
  const [userRoles, setUserRoles] = useState<Array<{ member_id: string; name: string; email: string; rbac_role: string; member_role: string }>>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/access', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load access assignments')
      const json = await res.json()
      setUserRoles(json.members || [])
    } catch {
      setToast({ message: 'Error loading access assignments', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'editor':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'viewer':
        return <Eye className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'editor':
        return 'bg-blue-100 text-blue-800'
      case 'viewer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Role priority for ordering (Admin → Editor → Viewer → None)
  const getRolePriority = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 1
      case 'editor': return 2
      case 'viewer': return 3
      default: return 4
    }
  }

  // Sort users by role priority, then by name
  const sortedUserRoles = userRoles.sort((a, b) => {
    // First sort by role priority
    const roleComparison = getRolePriority(a.rbac_role) - getRolePriority(b.rbac_role)
    if (roleComparison !== 0) return roleComparison
    
    // Then sort by name
    return a.name.localeCompare(b.name)
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Access Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* No manual add; assignments are derived from members */}
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toast.message && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
               onAnimationEnd={() => setTimeout(() => setToast({ message: '', type: '' }), 2500)}>
            {toast.message}
          </div>
        )}
        {loading && (
          <div className="bg-white shadow-lg rounded-lg p-12 text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading access assignments…</p>
          </div>
        )}
        {/* Access Roles Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Access Assignments ({sortedUserRoles.length})</h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign admin/editor/viewer console access to members
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUserRoles.map((userRole) => (
                  <tr key={userRole.member_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(userRole.rbac_role)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {userRole.name || 'Unknown Member'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userRole.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userRole.rbac_role)}`}>
                        {userRole.rbac_role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userRole.rbac_role === 'admin' && 'Full access to all features'}
                        {userRole.rbac_role === 'editor' && 'Can create and edit content'}
                        {userRole.rbac_role === 'viewer' && 'Can only view content'}
                        {userRole.rbac_role === 'none' && 'No console access'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          value={userRole.rbac_role}
                          onChange={async (e) => {
                            const newRole = e.target.value
                            try {
                              const res = await fetch('/api/access', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: userRole.email, role: newRole, name: userRole.name })
                              })
                              const json = await res.json().catch(() => ({}))
                              if (!res.ok) throw new Error(json?.error || 'Failed to update access')
                              setToast({ message: 'Access updated', type: 'success' })
                              load()
                            } catch (err: unknown) {
                              const errorMessage = err instanceof Error ? err.message : 'Error updating access'
                              setToast({ message: errorMessage, type: 'error' })
                            }
                          }}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Role Descriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-gray-900">Admin</h4>
              </div>
              <p className="text-sm text-gray-600">
                Full access to all features including user management, member management, and expense tracking.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Edit className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Editor</h4>
              </div>
              <p className="text-sm text-gray-600">
                Can create and edit content, manage members, and update expenses. Cannot manage user roles.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Eye className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Viewer</h4>
              </div>
              <p className="text-sm text-gray-600">
                Can only view content and reports. Cannot create, edit, or delete anything.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}