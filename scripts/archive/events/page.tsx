'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// Format time without timezone conversion
const formatTime = (dateTimeString: string) => {
  try {
    // Parse the ISO string directly without timezone conversion
    const cleanValue = dateTimeString.split('+')[0].split('Z')[0]
    const [, timePart] = cleanValue.split('T')
    if (!timePart) return 'Invalid time'
    
    const [hour24Str, minutePart] = timePart.split(':')
    const hour24 = parseInt(hour24Str)
    const minute = minutePart || '00'
    
    // Convert to 12-hour format
    let hour12 = hour24
    let period = 'AM'
    
    if (hour24 === 0) {
      hour12 = 12
      period = 'AM'
    } else if (hour24 < 12) {
      hour12 = hour24
      period = 'AM'
    } else if (hour24 === 12) {
      hour12 = 12
      period = 'PM'
    } else {
      hour12 = hour24 - 12
      period = 'PM'
    }
    
    return `${hour12}:${minute} ${period}`
  } catch {
    return 'Invalid time'
  }
}

// Filter out past events - only show upcoming events
const filterUpcomingEvents = (events: EventItem[]) => {
  const now = new Date()
  return events.filter(event => {
    try {
      // Parse the event start time
      const eventDate = new Date(event.starts_at)
      // Only show events that are in the future
      return eventDate > now
    } catch {
      // If we can't parse the date, include it (better to show than hide)
      return true
    }
  })
}

type EventItem = {
  id: string
  team_id: string
  title: string
  type: 'match' | 'practice'
  opposition?: string | null
  location: string
  notes?: string | null
  starts_at: string
  ends_at?: string | null
  tournament_formats: {
    name: string
  }
}

type Format = {
  id: string
  name: string
  description: string
  seasonId: string
  seasonName: string
  seasonYear: number
}

type TeamMember = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  rsvpStatus: 'yes' | 'no' | 'maybe' | null
  respondedAt: string | null
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formats, setFormats] = useState<Format[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const [userProfile, setUserProfile] = useState<{
    teamId: string
    teamName: string
    firstName: string
    lastName: string
    role: string
    email: string
  } | null>(null)

  // Handle authentication - redirect to member console
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/member/login')
    } else if (status === 'authenticated') {
      // If authenticated, redirect to member events
      router.push('/member/events')
    }
  }, [status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  // Fetch user profile to get team information
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()
        if (res.ok && data.member) {
          setUserProfile({
            teamId: data.member.teamId,
            teamName: data.member.teamName,
            firstName: data.member.firstName,
            lastName: data.member.lastName,
            role: data.member.role,
            email: data.member.email
          })
        } else {
          setError(data.error || 'Failed to load profile')
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      }
    }
    loadProfile()
  }, [])

  // Load unread notifications for admins
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userProfile || userProfile.role !== 'admin') return
      
      try {
        const res = await fetch('/api/notifications?unreadOnly=true')
        const data = await res.json()
        if (res.ok) {
          setUnreadNotifications(data.notifications.length)
        }
      } catch (e: unknown) {
        // Silently fail - notifications are not critical
        console.error('Failed to load notifications:', e)
      }
    }
    
    loadNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userProfile])

  // Load available formats for user's team
  useEffect(() => {
    const loadFormats = async () => {
      if (!userProfile?.teamId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/teams/${userProfile.teamId}/formats`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load formats')
        setFormats(data.formats)
        
        // Restore state from URL parameters
        const seasonParam = searchParams.get('season')
        const formatParam = searchParams.get('format')
        
        if (seasonParam) {
          setSelectedSeason(seasonParam)
        }
        
        if (formatParam && data.formats) {
          const format = data.formats.find((f: Format) => f.id === formatParam)
          if (format) {
            setSelectedFormat(format)
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load formats')
      } finally {
        setLoading(false)
      }
    }
    loadFormats()
  }, [userProfile?.teamId, searchParams])

  // Load events for selected format
  useEffect(() => {
    const loadEvents = async () => {
      if (!userProfile?.teamId || !selectedFormat) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/events?teamId=${userProfile.teamId}&format=${selectedFormat.name}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load events')
        // Filter out past events - only show upcoming events
        const upcomingEvents = filterUpcomingEvents(data.events)
        setEvents(upcomingEvents)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [userProfile?.teamId, selectedFormat])


  const updateURL = (season: string, format: string) => {
    const params = new URLSearchParams()
    if (season) params.set('season', season)
    if (format) params.set('format', format)
    
    const newURL = params.toString() ? `?${params.toString()}` : '/events'
    router.replace(newURL, { scroll: false })
  }

  const handleSeasonSelect = (seasonId: string) => {
    setSelectedSeason(seasonId)
    setSelectedFormat(null)
    updateURL(seasonId, '')
  }

  const handleFormatSelect = (format: Format) => {
    setSelectedFormat(format)
    updateURL(selectedSeason, format.id)
  }

  // Get unique seasons from formats
  const seasons = formats.reduce((acc, format) => {
    if (!acc.find(s => s.id === format.seasonId)) {
      acc.push({
        id: format.seasonId,
        name: format.seasonName,
        year: format.seasonYear
      })
    }
    return acc
  }, [] as Array<{ id: string; name: string; year: number }>)

  // Filter formats by selected season
  const filteredFormats = selectedSeason 
    ? formats.filter(format => format.seasonId === selectedSeason)
    : formats

  const isAdmin = userProfile?.role === 'admin'

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Team Events & RSVPs</h1>
            {userProfile && (
              <p className="text-gray-600 mt-1">
                Welcome, {userProfile.firstName}! <span className="font-medium text-blue-600">{userProfile.teamName}</span> team.
              </p>
            )}
          </div>
          {isAdmin && unreadNotifications > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="relative">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </div>
              <span className="text-sm text-red-700">
                {unreadNotifications} new RSVP{unreadNotifications !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {error && <div className="text-red-600 mb-3">{error}</div>}
      
      {!userProfile ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your profile...</p>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Season and Format Selection */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Season Selection */}
              <div className="flex items-center gap-4">
                <label htmlFor="season-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Season:
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={(e) => handleSeasonSelect(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-1 max-w-xs"
                >
                  <option value="">All seasons</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name} ({season.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Selection */}
              <div className="flex items-center gap-4">
                <label htmlFor="format-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Format:
                </label>
                <select
                  id="format-select"
                  value={selectedFormat?.id || ''}
                  onChange={(e) => {
                    const format = filteredFormats.find(f => f.id === e.target.value)
                    if (format) {
                      handleFormatSelect(format)
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-0 flex-1 max-w-xs"
                  disabled={!selectedSeason}
                >
                  <option value="">Choose format...</option>
                  {filteredFormats.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formats.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">No upcoming events found for your team.</p>
            )}
            {selectedSeason && filteredFormats.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">No formats found for the selected season.</p>
            )}
          </div>

          {/* Events List */}
          {selectedFormat && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Events - {selectedFormat.name} ({selectedFormat.seasonName} {selectedFormat.seasonYear})
              </h3>
              {events.length === 0 ? (
                <p className="text-gray-500">No upcoming {selectedFormat.name} events found.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="mt-1 text-sm text-gray-600">
                            <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium mr-2">
                              {event.type.toUpperCase()}
                            </span>
                            <span className="mr-2">📅 {new Date(event.starts_at).toLocaleDateString()}</span>
                            <span className="mr-2">🕐 {formatTime(event.starts_at)}</span>
                            <span className="mr-2">📍 {event.location}</span>
                          </div>
                          {event.opposition && (
                            <div className="mt-1 text-sm text-gray-600">
                              vs <span className="font-medium">{event.opposition}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => router.push(`/events/${event.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}



