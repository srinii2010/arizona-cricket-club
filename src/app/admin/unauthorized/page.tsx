'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Shield, AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access the admin console.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          
          {session?.user && (
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Name:</strong> {session.user.name}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Status:</strong> <span className="text-red-600">Not Authorized</span></p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              To gain access to the admin console, please contact the club administrator to:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Add your email to the authorized users list</li>
              <li>Assign you the appropriate role (Admin, Editor, or Viewer)</li>
            </ul>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact: arizonacricketclub.acc@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}