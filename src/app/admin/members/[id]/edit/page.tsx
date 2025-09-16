'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'
import { getUserPermissions, UserRole } from '@/lib/permissions'

interface Team {
  id: string
  name: string
}

export default function EditMemberPage() {
  const { data: session } = useSession()
  const user = session?.user
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const memberId = params?.id

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    team_id: '',
    role: 'member',
    date_of_birth: '',
    gender: ''
  })

  useEffect(() => {
    if (!memberId) return
    Promise.all([loadTeams(), loadMember()]).finally(() => setLoading(false))
  }, [memberId])

  const loadTeams = async () => {
    const res = await fetch('/api/teams', { cache: 'no-store' })
    if (!res.ok) return
    const json = await res.json()
    setTeams(json.teams || [])
  }

  const loadMember = async () => {
    const res = await fetch(`/api/members/${memberId}`, { cache: 'no-store' })
    if (!res.ok) return
    const json = await res.json()
    const m = json.member
    setFormData({
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      email: m.email || '',
      phone: m.phone || '',
      team_id: m.team_id || '',
      role: m.role || 'member',
      date_of_birth: m.date_of_birth ? String(m.date_of_birth).slice(0, 10) : '',
      gender: m.gender || ''
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.team_id) newErrors.team_id = 'Team is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null
        })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to update member')
      setToast({ message: 'Member updated successfully', type: 'success' })
      router.push('/admin/members')
    } catch (err: unknown) {
      setToast({ message: (err as Error)?.message || 'Error updating member', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null;
  }

  const userRole = (user as { role?: string })?.role as UserRole || 'viewer';
  const permissions = getUserPermissions(userRole);

  if (!permissions.canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to edit members.</p>
          <Link href="/admin/members" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Members
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AdminGuard requiredRole="editor">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard requiredRole="editor">
    <div className="min-h-screen bg-gray-50">
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             onAnimationEnd={() => setTimeout(() => setToast({ message: '', type: '' }), 2500)}>
          {toast.message}
        </div>
      )}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
            <Link href="/admin/members" className="text-gray-600 hover:text-blue-600">
              ← Back to Members
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team *</label>
                <select name="team_id" value={formData.team_id} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.team_id ? 'border-red-500' : 'border-gray-300'}`}>
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.team_id && <p className="mt-1 text-sm text-red-600">{errors.team_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="member">Member</option>
                  <option value="coach">Coach</option>
                  <option value="manager">Manager</option>
                  <option value="captain">Captain</option>
                  <option value="vice_captain">Vice Captain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text_sm font-medium text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/members" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </AdminGuard>
  )
}


