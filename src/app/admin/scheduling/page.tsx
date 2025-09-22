'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AdminGuard from '@/components/AdminGuard'

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
  teams?: { name: string }
}

type Team = {
  id: string
  name: string
}

export default function SchedulingPage() {
  useSession()
  const [events, setEvents] = useState<EventItem[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Load teams
        const teamsRes = await fetch('/api/teams')
        const teamsData = await teamsRes.json()
        if (!teamsRes.ok) throw new Error(teamsData.error || 'Failed to load teams')
        setTeams(teamsData.teams)

        // Load all events (no team filter for admin view)
        const eventsRes = await fetch('/api/events')
        const eventsData = await eventsRes.json()
        if (!eventsRes.ok) throw new Error(eventsData.error || 'Failed to load events')
        setEvents(eventsData.events)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <AdminGuard requiredRole="editor">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Scheduling</h1>
        <p className="text-gray-600 mb-4">Create and manage events for Rattlers and Vipers.</p>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <div className="border rounded p-4 mb-6">
          <EventForm teams={teams} onCreated={(evt) => setEvents((prev) => [evt, ...prev])} />
        </div>

        <div className="mt-4">
          {loading ? (
            <div>Loading events...</div>
          ) : (
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-gray-600">
                        {e.teams?.name || 'Unknown Team'} • {e.type.toUpperCase()} • {e.format} • {new Date(e.starts_at).toLocaleString()} • {e.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && <div className="text-gray-600">No upcoming events.</div>}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  )
}

function EventForm({ teams, onCreated }: { teams: Team[], onCreated: (evt: EventItem) => void }) {
  const [form, setForm] = useState({
    team_id: '',
    title: '',
    type: 'match',
    format: 'T20',
    location: '',
    notes: '',
    starts_at: '',
    ends_at: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          notes: form.notes || null,
          ends_at: form.ends_at || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create event')
      onCreated(data.event)
      setForm({ team_id: '', title: '', type: 'match', format: 'T20', location: '', notes: '', starts_at: '', ends_at: '' })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="md:col-span-2 text-red-600">{error}</div>}
      <select className="border rounded p-2" value={form.team_id} onChange={(e) => setForm({ ...form, team_id: e.target.value })} required>
        <option value="">Select Team</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
      <input className="border rounded p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <select className="border rounded p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'match' | 'practice' })}>
        <option value="match">Match</option>
        <option value="practice">Practice</option>
      </select>
      <select className="border rounded p-2" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as 'T20' | 'T40' })}>
        <option value="T20">T20</option>
        <option value="T40">T40</option>
      </select>
      <input className="border rounded p-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
      <input className="border rounded p-2" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <input className="border rounded p-2" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} required />
      <input className="border rounded p-2" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
      <div className="md:col-span-2">
        <button disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}


