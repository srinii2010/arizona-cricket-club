'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
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

export default function NewMemberDuesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tournamentFormats, setTournamentFormats] = useState<TournamentFormat[]>([]);
  const [formData, setFormData] = useState({
    member_id: '',
    year: '',
    tournament_format_ids: [] as string[],
    season_dues: '',
    extra_dues: '',
    credit_adjustment: '',
    due_date: '',
    comments: ''
  });

  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  useEffect(() => {
    fetchMembers();
    fetchSeasons();
  }, []);

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

  const handleFormatChange = (formatId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tournament_format_ids: checked
        ? [...prev.tournament_format_ids, formatId]
        : prev.tournament_format_ids.filter(id => id !== formatId)
    }));
  };

  const calculateTotal = () => {
    const seasonDues = parseFloat(formData.season_dues) || 0;
    const extraDues = parseFloat(formData.extra_dues) || 0;
    const creditAdjustment = parseFloat(formData.credit_adjustment) || 0;
    return seasonDues + extraDues - creditAdjustment;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.member_id || !formData.year || formData.tournament_format_ids.length === 0 || !formData.season_dues || !formData.due_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/member-dues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          season_dues: parseFloat(formData.season_dues),
          extra_jersey_dues: parseFloat(formData.extra_dues) || 0,
          extra_trouser_dues: 0,
          credit_adjustment: parseFloat(formData.credit_adjustment) || 0
        }),
      });

      if (response.ok) {
        // Send initial notification
        try {
          const selectedMember = members.find(m => m.id === formData.member_id);
          const selectedSeason = seasons.find(s => s.year.toString() === formData.year);
          
          if (selectedMember && selectedSeason) {
            await fetch('/api/notifications/member-dues', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'initial',
                memberEmail: selectedMember.email,
                memberName: `${selectedMember.first_name} ${selectedMember.last_name}`,
                duesAmount: parseFloat(formData.season_dues),
                dueDate: formData.due_date,
                season: `${selectedSeason.year}-${selectedSeason.year + 1}`,
              }),
            });
          }
        } catch (notificationError) {
          console.error('Failed to send initial notification:', notificationError);
          // Don't fail the entire operation if notification fails
        }
        
        router.push('/admin/expenses/member-dues');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create member dues');
      }
    } catch {
      setError('Failed to create member dues');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedMember = members.find(m => m.id === formData.member_id);
  const totalDues = calculateTotal();

  if (!user) {
    return null;
  }

  const userRole = (user as { role?: string })?.role as UserRole || 'viewer';
  const permissions = getUserPermissions(userRole);

  // Check if user can create member dues
  if (!permissions.canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to create member dues.</p>
          <Link href="/admin/expenses/member-dues" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Member Dues
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
                href="/admin/expenses/member-dues"
                className="text-gray-400 hover:text-gray-600 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Member Dues</h1>
                <p className="mt-2 text-gray-600">
                  Create dues entry for a club member
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

            {/* Member Selection */}
            <div>
              <label htmlFor="member_id" className="block text-sm font-medium text-gray-700">
                Member *
              </label>
              <select
                name="member_id"
                id="member_id"
                value={formData.member_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                required
              >
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name} ({member.email})
                  </option>
                ))}
              </select>
              {selectedMember && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
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
            </div>

            {/* Season (Year) and Due Date */}
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                    <Link href="/admin/seasons" className="text-green-600 hover:text-green-500 ml-1">
                      Create a season first
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Tournament Formats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tournament Formats * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tournamentFormats.map((format) => (
                  <label key={format.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tournament_format_ids.includes(format.id)}
                      onChange={(e) => handleFormatChange(format.id, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{format.name}</div>
                      {format.description && (
                        <div className="text-sm text-gray-500">{format.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {tournamentFormats.length === 0 && formData.year && (
                <div className="text-sm text-gray-500 mt-2">
                  No tournament formats available for this season. 
                  <Link href="/admin/seasons" className="text-green-600 hover:text-green-500 ml-1">
                    Add tournament formats to the season
                  </Link>
                </div>
              )}
            </div>

            {/* Dues Amounts */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Dues Breakdown</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="season_dues" className="block text-sm font-medium text-gray-700">
                    Season Dues *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="season_dues"
                      id="season_dues"
                      value={formData.season_dues}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="extra_dues" className="block text-sm font-medium text-gray-700">
                    Extra Dues (Jersey/Trouser)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="extra_dues"
                      id="extra_dues"
                      value={formData.extra_dues}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="credit_adjustment" className="block text-sm font-medium text-gray-700">
                    Credit Adjustment
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="credit_adjustment"
                      id="credit_adjustment"
                      value={formData.credit_adjustment}
                      onChange={handleInputChange}
                      step="0.01"
                      className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Total Dues:</span>
                  <span className="text-lg font-bold text-green-900">
                    {formatCurrency(totalDues)}
                  </span>
                </div>
              </div>
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Any additional notes or comments..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/expenses/member-dues"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Member Dues'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}
