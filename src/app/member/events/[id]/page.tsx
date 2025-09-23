'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
  teams: {
    name: string
  }
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

export default function MemberEventDetailsPage() {
  const { status } = useSession()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<EventItem | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{
    teamId: string
    teamName: string
    firstName: string
    lastName: string
    role: string
    email: string
  } | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)

  // Build back URL with preserved parameters
  const buildBackUrl = () => {
    const season = searchParams.get('season')
    const format = searchParams.get('format')
    const params = new URLSearchParams()
    if (season) params.set('season', season)
    if (format) params.set('format', format)
    return params.toString() ? `/member/events?${params.toString()}` : '/member/events'
  }

  // Handle authentication - redirect to member login instead of admin login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/member/login')
    }
  }, [status, router])

  // Fetch user profile
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

  // Fetch admin role from access API
  useEffect(() => {
    const loadAdminRole = async () => {
      try {
        const res = await fetch('/api/access')
        const data = await res.json()
        if (res.ok && data.members) {
          // Find current user's admin role
          const currentUser = data.members.find((member: { email: string; rbac_role: string }) => 
            member.email === userProfile?.email
          )
          if (currentUser) {
            setAdminRole(currentUser.rbac_role)
          }
        }
      } catch (e: unknown) {
        console.error('Failed to load admin role:', e)
      }
    }
    
    if (userProfile?.email) {
      loadAdminRole()
    }
  }, [userProfile?.email])

  // Load event details
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load event')
        setEvent(data.event)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    loadEvent()
  }, [eventId])

  // Load team members and RSVPs
  useEffect(() => {
    const loadTeamRsvps = async () => {
      if (!eventId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/events/${eventId}/team-rsvps`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load team RSVPs')
        setTeamMembers(data.teamMembers)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load team RSVPs')
      } finally {
        setLoading(false)
      }
    }
    loadTeamRsvps()
  }, [eventId])

  const handleRsvpUpdate = async (memberId: string, status: 'yes' | 'no' | 'maybe') => {
    if (!eventId) return
    
    console.log('handleRsvpUpdate called with memberId:', memberId, 'status:', status)
    
    try {
      const res = await fetch(`/api/events/${eventId}/team-rsvps`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, status })
      })
      
      console.log('Admin RSVP API response:', res.status, res.statusText)
      
      if (!res.ok) {
        const data = await res.json()
        console.error('Admin RSVP API error:', data)
        throw new Error(data.error || 'Failed to update RSVP')
      }
      
      // Refresh team members list
      const teamRes = await fetch(`/api/events/${eventId}/team-rsvps`)
      const teamData = await teamRes.json()
      if (teamRes.ok) {
        setTeamMembers(teamData.teamMembers)
      }
    } catch (e: unknown) {
      console.error('handleRsvpUpdate error:', e)
      setError(e instanceof Error ? e.message : 'Failed to update RSVP')
    }
  }

  const handleMyRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!eventId) return
    
    console.log('handleMyRsvp called with status:', status)
    
    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      console.log('My RSVP API response:', res.status, res.statusText)
      
      if (!res.ok) {
        const data = await res.json()
        console.error('My RSVP API error:', data)
        throw new Error(data.error || 'Failed to update RSVP')
      }
      
      // Refresh team members list
      const teamRes = await fetch(`/api/events/${eventId}/team-rsvps`)
      const teamData = await teamRes.json()
      if (teamRes.ok) {
        setTeamMembers(teamData.teamMembers)
      }
    } catch (e: unknown) {
      console.error('handleMyRsvp error:', e)
      setError(e instanceof Error ? e.message : 'Failed to update RSVP')
    }
  }

  // Get admin status from the current user's member record in the team
  const currentUserMember = teamMembers.find(member => member.email === userProfile?.email)
  const isAdmin = adminRole === 'admin'
  
  // Debug admin status
  console.log('User Profile:', userProfile)
  console.log('Current User Member:', currentUserMember)
  console.log('Admin Role from Access API:', adminRole)
  console.log('Is Admin:', isAdmin)

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <Link
            href={buildBackUrl()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href={buildBackUrl()} className="text-2xl font-bold text-green-800">
                ← Member Events
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userProfile?.firstName} {userProfile?.lastName} • {userProfile?.teamName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-gray-600 mt-1">
            {event.teams.name} • {event.tournament_formats.name}
          </p>
        </div>
        
        {error && <div className="text-red-600 mb-3">{error}</div>}
        
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900">{event.type.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{new Date(event.starts_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="text-sm text-gray-900">{formatTime(event.starts_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm text-gray-900">{event.location}</p>
              </div>
              {event.opposition && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Opposition</label>
                  <p className="text-sm text-gray-900">{event.opposition}</p>
                </div>
              )}
              {event.notes && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm text-gray-900">{event.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Availability */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Team Availability</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isAdmin 
                  ? "Click YES/NO/MAYBE buttons to edit any member's RSVP" 
                  : "Click YES/NO/MAYBE buttons in your row to set your RSVP"
                }
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => {
                    const isCurrentUser = member.email === userProfile?.email
                    
                    // Permission logic:
                    // - Admin: Can edit anyone's RSVP
                    // - Non-admin: Can only edit their own RSVP
                    const canEdit = isAdmin || isCurrentUser
                    
                    // Debug logging (commented out to avoid linting warnings)
                    // console.log('Member:', member.firstName, 'Email:', member.email, 'User Email:', userProfile?.email, 'Is Current User:', isCurrentUser, 'Is Admin:', isAdmin, 'Can Edit:', canEdit)
                    
                    // Additional debug for admin functionality
                    if (isAdmin && !isCurrentUser) {
                      // Admin trying to edit other member
                    }
                    
                    return (
                      <tr key={member.id} className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-green-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-green-600 font-medium">(You)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {canEdit ? (
                            <div className="flex gap-1">
                              {(['yes', 'no', 'maybe'] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    if (isCurrentUser) {
                                      handleMyRsvp(status)
                                    } else {
                                      handleRsvpUpdate(member.id, status)
                                    }
                                  }}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    member.rsvpStatus === status
                                      ? status === 'yes' ? 'bg-green-600 text-white' :
                                        status === 'no' ? 'bg-red-600 text-white' :
                                        'bg-yellow-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {status.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                              member.rsvpStatus === 'yes' ? 'bg-green-100 text-green-800' :
                              member.rsvpStatus === 'no' ? 'bg-red-100 text-red-800' :
                              member.rsvpStatus === 'maybe' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.rsvpStatus ? member.rsvpStatus.toUpperCase() : 'NOT SELECTED'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
