'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import AdminGuard from '@/components/AdminGuard'
import { getUserPermissions, UserRole, UserPermissions } from '@/lib/permissions'
import { Clock, Plus, Edit, Trash2, Calendar, Users, Trophy, Copy } from 'lucide-react'
import DateTimePicker from '@/components/DateTimePicker'

type Team = {
  id: string
  name: string
}

type Season = {
  id: string
  year: number
  name: string
  status: string
}

type TournamentFormat = {
  id: string
  name: string
  description: string
  season_id: string
}

type ScheduleEvent = {
  id: string
  team_id: string
  season_id: string
  tournament_format_id: string
  title: string
  opposition?: string | null
  type: 'match' | 'practice'
  location: string
  notes?: string | null
  starts_at: string
  ends_at?: string | null
  teams?: { name: string }
  seasons?: { name: string, year: number }
  tournament_formats?: { name: string }
}

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

export default function ScheduleManagementPage() {
  const { data: session } = useSession()
  const [teams, setTeams] = useState<Team[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [formats, setFormats] = useState<TournamentFormat[]>([])
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'team' | 'format'>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<string>('')

  // Get user permissions
  const userRole = (session?.user as { role?: string })?.role as UserRole || 'viewer'
  const permissions = getUserPermissions(userRole)


  // Filter events based on active tab and selections
  const filteredEvents = events.filter(event => {
    if (activeTab === 'team') {
      return selectedTeam ? event.team_id === selectedTeam : true
    } else if (activeTab === 'format') {
      return selectedFormat ? event.tournament_format_id === selectedFormat : true
    }
    return true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load teams
      const teamsRes = await fetch('/api/teams')
      const teamsData = await teamsRes.json()
      if (!teamsRes.ok) throw new Error(teamsData.error || 'Failed to load teams')
      setTeams(teamsData.teams)

      // Load seasons
      const seasonsRes = await fetch('/api/seasons')
      const seasonsData = await seasonsRes.json()
      if (!seasonsRes.ok) throw new Error(seasonsData.error || 'Failed to load seasons')
      setSeasons(seasonsData.seasons)

      // Load tournament formats
      const formatsRes = await fetch('/api/tournament-formats')
      const formatsData = await formatsRes.json()
      if (!formatsRes.ok) throw new Error(formatsData.error || 'Failed to load formats')
      setFormats(formatsData.formats)

      // Load events
      const eventsRes = await fetch('/api/events')
      const eventsData = await eventsRes.json()
      if (!eventsRes.ok) throw new Error(eventsData.error || 'Failed to load events')
      setEvents(eventsData.events)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (eventData: Partial<ScheduleEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      setEvents(prev => [data.event, ...prev])
      setShowCreateForm(false)
    } catch (e: unknown) {
      console.error('Create event error:', e)
      setError(e instanceof Error ? e.message : 'Failed to create event')
    }
  }

  const handleUpdateEvent = async (id: string, eventData: Partial<ScheduleEvent>) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      setEvents(prev => prev.map(e => e.id === id ? data.event : e))
      setEditingEvent(null)
    } catch (e: unknown) {
      console.error('Update event error:', e)
      setError(e instanceof Error ? e.message : 'Failed to update event')
    }
  }

  const handleEditEvent = async (event: ScheduleEvent) => {
    try {
      // Fetch fresh data from the database
      const response = await fetch(`/api/events/${event.id}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch event')
      
      setEditingEvent(result.event)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch event')
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete event')
      
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete event')
    }
  }

  const handleCopyEvent = (event: ScheduleEvent) => {
    // Create a copy of the event with a new title and clear the ID
    const copiedEvent = {
      ...event,
      id: '', // Clear the ID so it creates a new event
      title: `${event.title} (Copy)`, // Add (Copy) to the title
    }
    
    // Set the copied event for creating (not editing)
    setShowCreateForm(true)
    setEditingEvent(copiedEvent)
  }

  const handleCreateCopiedEvent = async (eventData: Partial<ScheduleEvent>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      setEvents(prev => [data.event, ...prev])
      setShowCreateForm(false)
      setEditingEvent(null)
    } catch (e: unknown) {
      console.error('Create copied event error:', e)
      setError(e instanceof Error ? e.message : 'Failed to create copied event')
    }
  }

  const handleBulkCreate = async (teamId: string, seasonId: string, formatId: string, gameCount: number) => {
    try {
      const res = await fetch('/api/events/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          season_id: seasonId,
          tournament_format_id: formatId,
          game_count: gameCount
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create events')
      
      setEvents(prev => [...data.events, ...prev])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create events')
    }
  }

  return (
    <AdminGuard requiredRole="viewer">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                {permissions.canCreate && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </button>
                    <BulkCreateForm
                      teams={teams}
                      seasons={seasons}
                      formats={formats}
                      onCreate={handleBulkCreate}
                    />
                  </div>
                )}
                <a href="/admin" className="text-gray-600 hover:text-indigo-600">
                  ← Back to Admin
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}

        {permissions.canCreate && showCreateForm && (
          <EventForm
            teams={teams}
            seasons={seasons}
            formats={formats}
            event={editingEvent}
            onSubmit={editingEvent ? handleCreateCopiedEvent : handleCreateEvent}
            onCancel={() => {
              setShowCreateForm(false)
              setEditingEvent(null)
            }}
          />
        )}

        {permissions.canEdit && editingEvent && editingEvent.id && (
          <EventForm
            teams={teams}
            seasons={seasons}
            formats={formats}
            event={editingEvent}
            onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
            onCancel={() => setEditingEvent(null)}
          />
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Scheduled Events</h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setActiveTab('all')
                    setSelectedTeam('')
                    setSelectedFormat('')
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => {
                    setActiveTab('team')
                    setSelectedFormat('')
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'team' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  By Team
                </button>
                <button
                  onClick={() => {
                    setActiveTab('format')
                    setSelectedTeam('')
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'format' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  By Format
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : (
              <>
                {/* Always show filter dropdowns when their tabs are active */}
                {activeTab === 'team' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Team:</label>
                    <select
                      className="border rounded p-2"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                      <option value="">All Teams</option>
                      {teams?.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      )) || []}
                    </select>
                  </div>
                )}
                {activeTab === 'format' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Format:</label>
                    <select
                      className="border rounded p-2"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                      <option value="">All Formats</option>
                      {formats?.map(format => (
                        <option key={format.id} value={format.id}>{format.name}</option>
                      )) || []}
                    </select>
                  </div>
                )}
                
                {/* Show events or no events message */}
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {activeTab === 'team' && selectedTeam ? 
                      `No events found for ${teams.find(t => t.id === selectedTeam)?.name || 'selected team'}` :
                      activeTab === 'format' && selectedFormat ?
                      `No events found for ${formats.find(f => f.id === selectedFormat)?.name || 'selected format'}` :
                      'No events scheduled'
                    }
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        permissions={permissions}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                        onCopy={handleCopyEvent}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </main>
      </div>
    </AdminGuard>
  )
}

function EventCard({ 
  event, 
  permissions,
  onEdit, 
  onDelete,
  onCopy
}: { 
  event: ScheduleEvent
  permissions: UserPermissions
  onEdit: (event: ScheduleEvent) => void
  onDelete: (id: string) => void
  onCopy: (event: ScheduleEvent) => void
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-lg">{event.title}</h3>
            {event.opposition && (
              <span className="text-sm text-gray-600">vs {event.opposition}</span>
            )}
            <span className={`px-2 py-1 text-xs rounded ${
              event.type === 'match' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {event.type.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {event.teams?.name || 'Unknown Team'}
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-1" />
              {event.seasons?.name || 'Unknown Season'} - {event.tournament_formats?.name || 'Unknown Format'}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(event.starts_at).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(event.starts_at)}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <strong>Location:</strong> {event.location}
            {event.notes && (
              <>
                <br />
                <strong>Notes:</strong> {event.notes}
              </>
            )}
          </div>
        </div>
        {(permissions.canEdit || permissions.canDelete) && (
          <div className="flex gap-2 ml-4">
            {permissions.canEdit && (
              <button
                onClick={() => onCopy(event)}
                className="p-2 text-gray-600 hover:text-green-600"
                title="Copy Event"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            {permissions.canEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-2 text-gray-600 hover:text-blue-600"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {permissions.canDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EventForm({
  teams,
  seasons,
  formats,
  event,
  onSubmit,
  onCancel
}: {
  teams: Team[]
  seasons: Season[]
  formats: TournamentFormat[]
  event?: ScheduleEvent | null
  onSubmit: (data: Partial<ScheduleEvent>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    team_id: event?.team_id || '',
    season_id: event?.season_id || '',
    tournament_format_id: event?.tournament_format_id || '',
    title: event?.title || '',
    opposition: event?.opposition || '',
    type: event?.type || 'match',
    location: event?.location || '',
    notes: event?.notes || '',
    starts_at: event?.starts_at || '',
    ends_at: event?.ends_at || '',
  })
  const [submitting, setSubmitting] = useState(false)

  // Update form when event prop changes (for editing)
  useEffect(() => {
    if (event) {
      setForm({
        team_id: event.team_id || '',
        season_id: event.season_id || '',
        tournament_format_id: event.tournament_format_id || '',
        title: event.title || '',
        opposition: event.opposition || '',
        type: event.type || 'match',
        location: event.location || '',
        notes: event.notes || '',
        starts_at: event.starts_at || '',
        ends_at: event.ends_at || '',
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        // Don't convert dates - they're already in the correct format from DateTimePicker
        starts_at: form.starts_at || '',
        ends_at: form.ends_at || null,
        notes: form.notes || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">
          {event ? 'Edit Event' : 'Create Event'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                className="w-full border rounded p-2"
                value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
                required
              >
                <option value="">Select Team</option>
                {teams?.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                )) || []}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                className="w-full border rounded p-2"
                value={form.season_id}
                onChange={(e) => setForm({ ...form, season_id: e.target.value })}
                required
              >
                <option value="">Select Season</option>
                {seasons?.map((season) => (
                  <option key={season.id} value={season.id}>{season.name} ({season.year})</option>
                )) || []}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                className="w-full border rounded p-2"
                value={form.tournament_format_id}
                onChange={(e) => setForm({ ...form, tournament_format_id: e.target.value })}
                required
              >
                <option value="">Select Format</option>
                {formats
                  ?.filter(f => f.season_id === form.season_id)
                  ?.map((format) => (
                    <option key={format.id} value={format.id}>{format.name}</option>
                  )) || []}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border rounded p-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'match' | 'practice' })}
              >
                <option value="match">Match</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                className="w-full border rounded p-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opposition</label>
              <input
                className="w-full border rounded p-2"
                value={form.opposition}
                onChange={(e) => setForm({ ...form, opposition: e.target.value })}
                placeholder="Opponent team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                className="w-full border rounded p-2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <DateTimePicker
                value={form.starts_at}
                onChange={(value) => setForm({ ...form, starts_at: value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time (Optional)</label>
              <DateTimePicker
                value={form.ends_at}
                onChange={(value) => setForm({ ...form, ends_at: value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (event ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkCreateForm({
  teams,
  seasons,
  formats,
  onCreate
}: {
  teams: Team[]
  seasons: Season[]
  formats: TournamentFormat[]
  onCreate: (teamId: string, seasonId: string, formatId: string, gameCount: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    team_id: '',
    season_id: '',
    tournament_format_id: '',
    game_count: 10
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onCreate(form.team_id, form.season_id, form.tournament_format_id, form.game_count)
      setShowForm(false)
      setForm({ team_id: '', season_id: '', tournament_format_id: '', game_count: 10 })
    } finally {
      setSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
      >
        <Plus className="h-4 w-4 mr-1" />
        Bulk Create
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Bulk Create Events</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              className="w-full border rounded p-2"
              value={form.team_id}
              onChange={(e) => setForm({ ...form, team_id: e.target.value })}
              required
            >
              <option value="">Select Team</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              )) || []}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              className="w-full border rounded p-2"
              value={form.season_id}
              onChange={(e) => setForm({ ...form, season_id: e.target.value, tournament_format_id: '' })}
              required
            >
              <option value="">Select Season</option>
              {seasons?.map((season) => (
                <option key={season.id} value={season.id}>{season.name} ({season.year})</option>
              )) || []}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              className="w-full border rounded p-2"
              value={form.tournament_format_id}
              onChange={(e) => setForm({ ...form, tournament_format_id: e.target.value })}
              required
            >
              <option value="">Select Format</option>
              {formats
                ?.filter(f => f.season_id === form.season_id)
                ?.map((format) => (
                  <option key={format.id} value={format.id}>{format.name}</option>
                )) || []}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Games</label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full border rounded p-2"
              value={form.game_count}
              onChange={(e) => setForm({ ...form, game_count: parseInt(e.target.value) || 10 })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : `Create ${form.game_count} Events`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
