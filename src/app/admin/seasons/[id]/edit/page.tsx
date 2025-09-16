'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Season {
  id: string;
  year: number;
  name: string;
  status: 'Active' | 'Inactive';
  tournament_formats: TournamentFormat[];
}

interface TournamentFormat {
  id: string;
  name: string;
  description?: string;
}

export default function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    name: '',
    status: 'Active' as 'Active' | 'Inactive',
    tournament_formats: [] as TournamentFormat[]
  });

  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  const fetchSeason = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seasons/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSeason(data.season);
        setFormData({
          year: data.season.year,
          name: data.season.name,
          status: data.season.status,
          tournament_formats: data.season.tournament_formats || []
        });
      } else {
        setError(data.error || 'Failed to fetch season');
      }
    } catch {
      setError('Failed to fetch season');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSeason();
  }, [fetchSeason]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTournamentFormat = () => {
    setFormData(prev => ({
      ...prev,
      tournament_formats: [
        ...prev.tournament_formats,
        { id: '', name: '', description: '' }
      ]
    }));
  };

  const updateTournamentFormat = (index: number, field: keyof TournamentFormat, value: string) => {
    setFormData(prev => ({
      ...prev,
      tournament_formats: prev.tournament_formats.map((format, i) => 
        i === index ? { ...format, [field]: value } : format
      )
    }));
  };

  const removeTournamentFormat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tournament_formats: prev.tournament_formats.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.year || !formData.name) {
      setError('Year and name are required');
      return;
    }

    // Validate tournament formats
    const validFormats = formData.tournament_formats.filter(format => format.name.trim());
    if (validFormats.length === 0) {
      setError('At least one tournament format is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tournament_formats: validFormats
        }),
      });

      if (response.ok) {
        router.push('/admin/seasons');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update season');
      }
    } catch {
      setError('Failed to update season');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !season) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/seasons"
              className="text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Seasons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/seasons"
                className="text-gray-400 hover:text-gray-600 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Season</h1>
                <p className="mt-2 text-gray-600">
                  Update season details and tournament formats
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Season Start Year *
                </label>
                <select
                  name="year"
                  id="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value={2024}>{formatSeason(2024)}</option>
                  <option value={2025}>{formatSeason(2025)}</option>
                  <option value={2026}>{formatSeason(2026)}</option>
                  <option value={2027}>{formatSeason(2027)}</option>
                  <option value={2028}>{formatSeason(2028)}</option>
                  <option value={2029}>{formatSeason(2029)}</option>
                  <option value={2030}>{formatSeason(2030)}</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Season: {formatSeason(formData.year)}
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Season Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 2025 Season"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Tournament Formats *
                </label>
                <button
                  type="button"
                  onClick={addTournamentFormat}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  + Add Format
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {formData.tournament_formats.map((format, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Format Name *
                        </label>
                        <input
                          type="text"
                          value={format.name}
                          onChange={(e) => updateTournamentFormat(index, 'name', e.target.value)}
                          placeholder="e.g., T20Platinum, T40DivA"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          value={format.description || ''}
                          onChange={(e) => updateTournamentFormat(index, 'description', e.target.value)}
                          placeholder="Optional description"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTournamentFormat(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {formData.tournament_formats.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tournament formats added yet.</p>
                    <p className="text-sm">Click &quot;Add Format&quot; to get started.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/seasons"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
