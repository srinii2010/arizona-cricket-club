'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

type EventItem = {
  id: string
  team_id: string
  title: string
  type: 'match' | 'practice'
  format: 'T20' | 'T40'
  location: string
  notes?: string | null
  starts_at: string
  ends_at?: string | null
}

export default function EventsPage() {
  useSession()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userProfile, setUserProfile] = useState<{
    teamId: string
    teamName: string
    firstName: string
    lastName: string
  } | null>(null)

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
            lastName: data.member.lastName
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

  // Load events for user's team
  useEffect(() => {
    const loadEvents = async () => {
      if (!userProfile?.teamId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/events?teamId=${userProfile.teamId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load events')
        setEvents(data.events)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [userProfile?.teamId])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Upcoming Events</h1>
        {userProfile && (
          <p className="text-gray-600 mt-1">
            Welcome, {userProfile.firstName}! Showing events for <span className="font-medium text-blue-600">{userProfile.teamName}</span> team.
          </p>
        )}
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
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <p>No upcoming events for {userProfile.teamName} team.</p>
              <p className="text-sm mt-1">Check back later or contact your team admin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: EventItem }) {
  const [status, setStatus] = useState<'yes' | 'no' | 'maybe' | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onRsvp = async (s: 'yes' | 'no' | 'maybe') => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/events/${event.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to RSVP')
      setStatus(s)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to RSVP')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded p-4">
      <div className="font-medium">{event.title}</div>
      <div className="text-sm text-gray-600">{event.type.toUpperCase()} • {event.format} • {new Date(event.starts_at).toLocaleString()} • {event.location}</div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <div className="flex gap-2 mt-3">
        {(['yes','no','maybe'] as const).map((s) => (
          <button
            key={s}
            disabled={saving}
            onClick={() => onRsvp(s)}
            className={`px-3 py-1 rounded border ${status === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}
          >{s.toUpperCase()}</button>
        ))}
      </div>
    </div>
  )
}


