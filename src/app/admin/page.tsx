'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Users, DollarSign, Calendar, Settings, LogOut, Trophy, Eye, Edit, Shield } from 'lucide-react'
import { getUserPermissions, UserRole } from '@/lib/permissions'
import AdminGuard from '@/components/AdminGuard'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  console.log('AdminDashboard - Session:', session)
  console.log('AdminDashboard - User:', user)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no session, return null (AdminGuard will handle redirect)
  if (!session || !user) {
    return null
  }

  const permissions = getUserPermissions((user.role as UserRole) || 'viewer')
  
  console.log('AdminDashboard - User role:', user.role)
  console.log('AdminDashboard - Permissions:', permissions)

  return (
    <AdminGuard requiredRole="viewer">
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
              <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'editor' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' && <Shield className="h-4 w-4 inline mr-1" />}
                {user.role === 'editor' && <Edit className="h-4 w-4 inline mr-1" />}
                {user.role === 'viewer' && <Eye className="h-4 w-4 inline mr-1" />}
                {user.role.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role-based welcome message */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to the Admin Console
            </h2>
            <p className="text-gray-600">
              {user.role === 'admin' && "You have full administrative access to all features."}
              {user.role === 'editor' && "You can view, create, and edit content. You cannot delete items or manage user access."}
              {user.role === 'viewer' && "You have read-only access to view information in the admin console."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Member Management */}
          {permissions.canManageMembers && (
            <Link href="/admin/members" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Member Management</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {permissions.canCreate ? 'Add, edit, and manage club members. Assign teams and roles.' : 'View club members and their information.'}
                </p>
              </div>
            </Link>
          )}

          {/* Season Management */}
          {permissions.canManageSeasons && (
            <Link href="/admin/seasons" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Season Management</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {permissions.canCreate ? 'Manage tournament seasons and formats.' : 'View tournament seasons and formats.'}
                </p>
              </div>
            </Link>
          )}

          {/* Expense Management */}
          {permissions.canManageExpenses && (
            <Link href="/admin/expenses" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Expense Management</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {permissions.canCreate ? 'Manage member dues and general expenses.' : 'View member dues and general expenses.'}
                </p>
              </div>
            </Link>
          )}

          {/* Team Management */}
          {permissions.canManageTeams && (
            <Link href="/admin/teams" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Team Management</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {permissions.canCreate ? 'Manage teams and team assignments.' : 'View teams and team assignments.'}
                </p>
              </div>
            </Link>
          )}

          {/* Access Management - Only for admins */}
          {permissions.canManageAccess && (
            <Link href="/admin/users" className="group">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-orange-600" />
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Access Management</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Grant admin/editor/viewer access to members.
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Show message if user has no permissions */}
        {!permissions.canView && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  You have limited access to the admin console. Contact an administrator for additional permissions.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </AdminGuard>
  )
}