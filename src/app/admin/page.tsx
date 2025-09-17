'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { Users, DollarSign, Calendar, Settings, LogOut, Trophy, Eye, Edit, Shield, Download, FileSpreadsheet } from 'lucide-react'
import { getUserPermissions, UserRole } from '@/lib/permissions'
import AdminGuard from '@/components/AdminGuard'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')

  console.log('AdminDashboard - Session:', session)
  console.log('AdminDashboard - User:', user)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleExportData = async () => {
    try {
      setExporting(true)
      setExportMessage('')
      
      const response = await fetch('/api/export/download', {
        method: 'GET',
      })

      if (response.ok) {
        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : 'Arizona_Cricket_Club_Export.xlsx'

        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setExportMessage(`Export completed successfully! File downloaded: ${filename}`)
      } else {
        const data = await response.json()
        setExportMessage(`Export failed: ${data.error}`)
      }
    } catch (error) {
      setExportMessage(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
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

  const permissions = getUserPermissions(((user as { role?: string })?.role as UserRole) || 'viewer')
  
  console.log('AdminDashboard - User role:', (user as { role?: string })?.role)
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
                (user as { role?: string })?.role === 'admin' ? 'bg-red-100 text-red-800' :
                (user as { role?: string })?.role === 'editor' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {(user as { role?: string })?.role === 'admin' && <Shield className="h-4 w-4 inline mr-1" />}
                {(user as { role?: string })?.role === 'editor' && <Edit className="h-4 w-4 inline mr-1" />}
                {(user as { role?: string })?.role === 'viewer' && <Eye className="h-4 w-4 inline mr-1" />}
                {(user as { role?: string })?.role?.toUpperCase() || 'VIEWER'}
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
              {(user as { role?: string })?.role === 'admin' && "You have full administrative access to all features."}
              {(user as { role?: string })?.role === 'editor' && "You can view, create, and edit content. You cannot delete items or manage user access."}
              {(user as { role?: string })?.role === 'viewer' && "You have read-only access to view information in the admin console."}
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

        {/* Data Export Section */}
        {permissions.canView && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
                    Data Export
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Export all member, dues, and expense data to Excel. File will be downloaded directly to your system.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={exporting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </>
                  )}
                </button>
              </div>
              {exportMessage && (
                <div className={`mt-4 p-3 rounded-md ${
                  exportMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {exportMessage}
                </div>
              )}
            </div>
          </div>
        )}

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