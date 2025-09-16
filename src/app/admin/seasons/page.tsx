'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { useSession } from 'next-auth/react';
import { getUserPermissions, UserRole } from '@/lib/permissions';

interface Season {
  id: string;
  year: number;
  name: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  tournament_formats: TournamentFormat[];
}

interface TournamentFormat {
  id: string;
  name: string;
  description?: string;
}

export default function SeasonsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seasons');
      const data = await response.json();
      
      if (response.ok) {
        setSeasons(data.seasons);
      } else {
        setError(data.error || 'Failed to fetch seasons');
      }
    } catch {
      setError('Failed to fetch seasons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (seasonId: string, seasonName: string) => {
    if (!confirm(`Are you sure you want to delete "${seasonName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(seasonId);
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSeasons(seasons.filter(season => season.id !== seasonId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete season');
      }
    } catch {
      alert('Failed to delete season');
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleStatus = async (seasonId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const response = await fetch(`/api/seasons/${seasonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSeasons(seasons.map(season => 
          season.id === seasonId 
            ? { ...season, status: newStatus as 'Active' | 'Inactive' }
            : season
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update season status');
      }
    } catch {
      alert('Failed to update season status');
    }
  };

  if (!user) {
    return null;
  }

  const permissions = getUserPermissions(((user as { role?: string })?.role as UserRole) || 'viewer');

  if (loading) {
    return (
      <AdminGuard requiredRole="viewer">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </AdminGuard>
    );
  }

  return (
    <AdminGuard requiredRole="viewer">
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Season Management</h1>
              <p className="mt-2 text-gray-600">
                Manage tournament seasons and their formats
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {permissions.canCreate && (
                <Link
                  href="/admin/seasons/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Season
                </Link>
              )}
              <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {seasons.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No seasons found</h3>
              <p className="mb-4">Get started by creating your first season.</p>
              <Link
                href="/admin/seasons/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Season
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Seasons</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {seasons.map((season) => (
                <div key={season.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">
                          {formatSeason(season.year)}
                        </h4>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          season.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {season.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {season.tournament_formats.length} tournament format{season.tournament_formats.length !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Created by: {(season as unknown as { created_by?: string }).created_by || 'N/A'}</div>
                        <div>Last updated by: {(season as unknown as { last_updated_by?: string }).last_updated_by || 'N/A'}</div>
                      </div>
                      {season.tournament_formats.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {season.tournament_formats.map((format) => (
                              <span
                                key={format.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {format.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {permissions.canEdit && (
                        <button
                          onClick={() => toggleStatus(season.id, season.status)}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            season.status === 'Active'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {season.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {permissions.canEdit && (
                        <Link
                          href={`/admin/seasons/${season.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>
                      )}
                      {permissions.canDelete && (
                        <button
                          onClick={() => handleDelete(season.id, season.name)}
                          disabled={deleteLoading === season.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deleteLoading === season.id ? (
                            <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
}
