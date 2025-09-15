import Link from 'next/link'

export default function AdminConsole() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-green-800">Admin Console</h1>
            </div>
            <Link href="/" className="text-gray-600 hover:text-green-600">← Back to Home</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Arizona Cricket Club</h2>
          <p className="text-xl text-gray-600">Administrative Dashboard</p>
        </div>

        {/* Admin Categories */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Category 1: Authoring Content */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Authoring Content</h3>
              <p className="text-gray-600 mb-6">Manage homepage content, sponsors, team information, and announcements</p>
              <div className="space-y-2">
                <Link href="/admin/content/homepage" className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Homepage Content
                </Link>
                <Link href="/admin/content/sponsors" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Sponsor Management
                </Link>
                <Link href="/admin/content/teams" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Team Information
                </Link>
                <Link href="/admin/content/news" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  News & Announcements
                </Link>
              </div>
            </div>
          </div>

          {/* Category 2: Expense Report Creation */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expense Report Creation</h3>
              <p className="text-gray-600 mb-6">Create and manage expense reports by year, category, and format</p>
              <div className="space-y-2">
                <Link href="/admin/expenses/yearly-dues" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Yearly Dues
                </Link>
                <Link href="/admin/expenses/categories" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Expense Categories
                </Link>
                <Link href="/admin/expenses/reports" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Report Formats
                </Link>
                <Link href="/admin/expenses/payments" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Payment Tracking
                </Link>
              </div>
            </div>
          </div>

          {/* Category 3: Schedule Management */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Schedule Management</h3>
              <p className="text-gray-600 mb-6">Manage game schedules, availability tracking, and venue management</p>
              <div className="space-y-2">
                <Link href="/admin/schedule/games" className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Game Scheduling
                </Link>
                <Link href="/admin/schedule/availability" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Availability Tracking
                </Link>
                <Link href="/admin/schedule/venues" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Venue Management
                </Link>
                <Link href="/admin/schedule/calendar" className="block w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Calendar View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}