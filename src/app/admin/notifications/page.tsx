'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminGuard from '@/components/AdminGuard'

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const sendDuesReminder = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications/dues-reminder', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Dues reminder sent to ${data.count} members`)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error sending dues reminder')
    } finally {
      setLoading(false)
    }
  }

  const sendDailyReport = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/notifications/daily-report', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        if (data.skipped) {
          setMessage('No changes detected, email not sent')
        } else {
          setMessage(`Daily report sent with ${data.changes} changes`)
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Error sending daily report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/admin"
                  className="text-gray-400 hover:text-gray-600 mr-4"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                  <p className="mt-2 text-gray-600">
                    Send dues reminders and daily reports
                  </p>
                </div>
              </div>
              <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
                ← Back to Admin
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
           
            {/* Dues Reminder */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Dues Reminder</h2>
              <p className="text-gray-600 mb-4">Send dues reminder to all members with unpaid dues</p>
              <button
                onClick={sendDuesReminder}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Dues Reminder'}
              </button>
            </div>

            {/* Daily Report */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Daily Report</h2>
              <p className="text-gray-600 mb-4">Send daily change report (only if there are changes)</p>
              <button
                onClick={sendDailyReport}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Daily Report'}
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">{message}</p>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}