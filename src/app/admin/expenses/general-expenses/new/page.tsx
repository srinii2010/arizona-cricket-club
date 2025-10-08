'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Trophy } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { useSession } from 'next-auth/react';
import { getUserPermissions, UserRole } from '@/lib/permissions';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface TournamentFormat {
  id: string;
  name: string;
  description?: string;
  seasons: {
    year: number;
  };
}

interface Season {
  id: string;
  year: number;
  name: string;
  status: string;
}

const categories = [
  'Umpire',
  'Equipment', 
  'Storage',
  'LiveStream',
  'Mat',
  'Food',
  'Others'
];

export default function NewGeneralExpensePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tournamentFormats, setTournamentFormats] = useState<TournamentFormat[]>([]);
  const [formData, setFormData] = useState({
    year: '',
    tournament_format_id: '',
    category: '',
    description: '',
    amount: '',
    paid_by_member_id: '',
    comments: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      
      if (response.ok) {
        setMembers(data.members || []);
      } else {
        setError('Failed to fetch members');
      }
    } catch {
      setError('Failed to fetch members');
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const data = await response.json();
      
      if (response.ok) {
        setSeasons(data.seasons || []);
        // Set the first season as default if available
        if (data.seasons && data.seasons.length > 0) {
          setFormData(prev => ({ ...prev, year: data.seasons[0].year.toString() }));
        }
      } else {
        setError('Failed to fetch seasons');
      }
    } catch {
      setError('Failed to fetch seasons');
    }
  };

  const fetchTournamentFormats = useCallback(async () => {
    try {
      const response = await fetch(`/api/tournament-formats?season_id=${seasons.find(s => s.year.toString() === formData.year)?.id || ''}`);
      const data = await response.json();
      
      if (response.ok) {
        setTournamentFormats(data.formats || []);
      } else {
        setError('Failed to fetch tournament formats');
      }
    } catch {
      setError('Failed to fetch tournament formats');
    }
  }, [seasons, formData.year]);

  useEffect(() => {
    fetchMembers();
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (formData.year) {
      fetchTournamentFormats();
    }
  }, [formData.year, fetchTournamentFormats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.category || !formData.amount || !formData.paid_by_member_id || !formData.expense_date) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.category === 'Others' && !formData.description) {
      setError('Description is required when category is "Others"');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/general-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          tournament_format_id: formData.tournament_format_id || null
        }),
      });

      if (response.ok) {
        router.push('/admin/expenses/general-expenses');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create general expense');
      }
    } catch {
      setError('Failed to create general expense');
    } finally {
      setLoading(false);
    }
  };


  const selectedMember = members.find(m => m.id === formData.paid_by_member_id);
  const selectedFormat = tournamentFormats.find(f => f.id === formData.tournament_format_id);

  if (!user) {
    return null;
  }

  const userRole = (user as { role?: string })?.role as UserRole || 'viewer';
  const permissions = getUserPermissions(userRole);

  // Check if user can create general expenses
  if (!permissions.canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to create general expenses.</p>
          <Link href="/admin/expenses/general-expenses" className="text-indigo-600 hover:text-indigo-500">
            ← Back to General Expenses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard requiredRole="editor">
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/expenses/general-expenses"
                className="text-gray-400 hover:text-gray-600 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add General Expense</h1>
                <p className="mt-2 text-gray-600">
                  Create a new general expense entry
                </p>
              </div>
            </div>
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
              ← Back to Admin
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Season (Year) and Category */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Season *
                </label>
                <select
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                >
                  <option value="">Select a season</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.year.toString()}>
                      {formatSeason(season.year)} - {season.name}
                    </option>
                  ))}
                </select>
                {seasons.length === 0 && (
                  <div className="text-sm text-gray-500 mt-2">
                    No seasons available. 
                    <Link href="/admin/seasons" className="text-red-600 hover:text-red-500 ml-1">
                      Create a season first
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description (required for Others) */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description {formData.category === 'Others' && '*'}
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={formData.category === 'Others' ? 'Please describe the expense...' : 'Optional description...'}
                required={formData.category === 'Others'}
              />
            </div>

            {/* Amount and Paid By */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paid_by_member_id" className="block text-sm font-medium text-gray-700">
                  Paid By *
                </label>
                <select
                  name="paid_by_member_id"
                  id="paid_by_member_id"
                  value={formData.paid_by_member_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700">
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expense_date"
                  id="expense_date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Member Details */}
            {selectedMember && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{selectedMember.first_name} {selectedMember.last_name}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedMember.email}</span>
                  <span className="mx-2">•</span>
                  <span>{selectedMember.phone}</span>
                </div>
              </div>
            )}

            {/* Tournament Format (Optional) */}
            <div>
              <label htmlFor="tournament_format_id" className="block text-sm font-medium text-gray-700">
                Tournament Format (Optional)
              </label>
              <select
                name="tournament_format_id"
                id="tournament_format_id"
                value={formData.tournament_format_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">All Formats (General Expense)</option>
{tournamentFormats
  .filter((format) => {
    const yearValue = Number.parseInt((formData.year || '').toString(), 10);
    const formatYear = format?.seasons?.year;
    if (!Number.isFinite(yearValue)) return false;
    if (typeof formatYear !== 'number') return false;
    return formatYear === yearValue;
  })
  .map((format) => (
    <option key={format.id} value={format.id}>
      {format.name} ({format.seasons?.year ?? '—'})
    </option>
  ))}
              </select>
              {selectedFormat && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>{selectedFormat.name}</span>
                    {selectedFormat.description && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{selectedFormat.description}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                id="comments"
                rows={3}
                value={formData.comments}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Any additional notes or comments..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/expenses/general-expenses"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}
