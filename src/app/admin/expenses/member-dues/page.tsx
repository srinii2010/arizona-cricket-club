'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface MemberDue {
  id: string;
  member_id: string;
  year: number;
  tournament_format_ids: string[];
  season_dues: number;
  extra_jersey_dues: number;
  extra_trouser_dues: number;
  credit_adjustment: number;
  total_dues: number;
  due_date: string;
  payment_status: 'Paid' | 'Not Paid';
  settlement_date?: string;
  comments?: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function MemberDuesPage() {
  const [dues, setDues] = useState<MemberDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [totals, setTotals] = useState<{ total_dues: number; paid_dues: number; pending_dues: number }>({ total_dues: 0, paid_dues: 0, pending_dues: 0 });

  const fetchDues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('year', selectedYear.toString());
      if (filterStatus !== 'all') {
        params.append('payment_status', filterStatus);
      }

      const response = await fetch(`/api/member-dues?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setDues(data.dues || []);
        setTotals(data.totals || { total_dues: 0, paid_dues: 0, pending_dues: 0 });
      } else {
        setError(data.error || 'Failed to fetch member dues');
      }
    } catch {
      setError('Failed to fetch member dues');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, filterStatus]);

  useEffect(() => {
    fetchDues();
  }, [fetchDues]);

  const handleSettleDues = async (dueId: string) => {
    try {
      const response = await fetch(`/api/member-dues/${dueId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settlement_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        await fetchDues(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to settle dues');
      }
    } catch {
      alert('Failed to settle dues');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  const getStatusIcon = (status: string) => {
    return status === 'Paid' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/admin/expenses"
                className="text-gray-400 hover:text-gray-600 mr-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Member Dues</h1>
                <p className="mt-2 text-gray-600">
                  Track yearly dues, payment status, and settlements
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/expenses/member-dues/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Member Dues
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season (Year)</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value={2024}>{formatSeason(2024)}</option>
                <option value={2025}>{formatSeason(2025)}</option>
                <option value={2026}>{formatSeason(2026)}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All</option>
                <option value="Not Paid">Not Paid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-md bg-gray-50">
              <div className="text-sm text-gray-500">Total Dues</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totals.total_dues || 0)}</div>
            </div>
            <div className="p-3 rounded-md bg-green-50">
              <div className="text-sm text-green-700">Paid</div>
              <div className="text-xl font-bold text-green-900">{formatCurrency(totals.paid_dues || 0)}</div>
            </div>
            <div className="p-3 rounded-md bg-red-50">
              <div className="text-sm text-red-700">Pending</div>
              <div className="text-xl font-bold text-red-900">{formatCurrency(totals.pending_dues || 0)}</div>
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

        {dues.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No member dues found</h3>
              <p className="mb-4">Get started by adding member dues for the selected year.</p>
              <Link
                href="/admin/expenses/member-dues/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Member Dues
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Member Dues for {formatSeason(selectedYear)}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Season Dues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extra Dues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dues.map((due) => (
                    <tr key={due.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {due.members.first_name} {due.members.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{due.members.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(due.season_dues)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(due.extra_jersey_dues + due.extra_trouser_dues)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(due.total_dues)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(due.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(due.payment_status)}`}>
                          {getStatusIcon(due.payment_status)}
                          <span className="ml-1">{due.payment_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {due.payment_status === 'Not Paid' && (
                          <button
                            onClick={() => handleSettleDues(due.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark as Paid
                          </button>
                        )}
                        {due.payment_status === 'Paid' && due.settlement_date && (
                          <span className="text-gray-500">
                            Settled {formatDate(due.settlement_date)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {due.created_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {due.last_updated_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={due.comments || ''}>
                        {due.comments || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
