'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Receipt, CheckCircle, XCircle } from 'lucide-react';

interface GeneralExpense {
  id: string;
  year: number;
  tournament_format_id?: string;
  category: string;
  description?: string;
  amount: number;
  paid_by_member_id: string;
  settlement_status: 'Settled' | 'Not Settled';
  settlement_date?: string;
  comments?: string;
  members: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  tournament_formats?: {
    id: string;
    name: string;
  };
}

export default function GeneralExpensesPage() {
  const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
  const [totals, setTotals] = useState<{ total_amount: number; settled_amount: number; pending_amount: number }>({ total_amount: 0, settled_amount: 0, pending_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = [
    'Umpire',
    'Equipment', 
    'Storage',
    'LiveStream',
    'Mat',
    'Food',
    'Others'
  ];

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('year', selectedYear.toString());
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (filterStatus !== 'all') {
        params.append('settlement_status', filterStatus);
      }

      const response = await fetch(`/api/general-expenses?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setExpenses(data.expenses || []);
        setTotals(data.totals || { total_amount: 0, settled_amount: 0, pending_amount: 0 });
      } else {
        setError(data.error || 'Failed to fetch general expenses');
      }
    } catch {
      setError('Failed to fetch general expenses');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, filterCategory, filterStatus]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSettleExpense = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/general-expenses/${expenseId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settlement_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        await fetchExpenses(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to settle expense');
      }
    } catch {
      alert('Failed to settle expense');
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

  const getStatusIcon = (status: string) => {
    return status === 'Settled' ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'Settled' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Umpire': 'bg-blue-100 text-blue-800',
      'Equipment': 'bg-purple-100 text-purple-800',
      'Storage': 'bg-yellow-100 text-yellow-800',
      'LiveStream': 'bg-pink-100 text-pink-800',
      'Mat': 'bg-indigo-100 text-indigo-800',
      'Food': 'bg-orange-100 text-orange-800',
      'Others': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
                <h1 className="text-3xl font-bold text-gray-900">General Expenses</h1>
                <p className="mt-2 text-gray-600">
                  Track umpire fees, equipment, and other club expenses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/expenses/general-expenses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
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
                className="border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value={2024}>{formatSeason(2024)}</option>
                <option value={2025}>{formatSeason(2025)}</option>
                <option value={2026}>{formatSeason(2026)}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All</option>
                <option value="Not Settled">Not Settled</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-md bg-gray-50">
              <div className="text-sm text-gray-500">Total Expenses</div>
              <div className="text-xl font-bold text-gray-900">{formatCurrency(totals.total_amount || 0)}</div>
            </div>
            <div className="p-3 rounded-md bg-green-50">
              <div className="text-sm text-green-700">Settled</div>
              <div className="text-xl font-bold text-green-900">{formatCurrency(totals.settled_amount || 0)}</div>
            </div>
            <div className="p-3 rounded-md bg-red-50">
              <div className="text-sm text-red-700">Pending</div>
              <div className="text-xl font-bold text-red-900">{formatCurrency(totals.pending_amount || 0)}</div>
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

        {expenses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="mb-4">Get started by adding general expenses for the selected year.</p>
              <Link
                href="/admin/expenses/general-expenses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                General Expenses for {formatSeason(selectedYear)}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tournament
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Date
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
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {expense.members.first_name} {expense.members.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{expense.members.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.tournament_formats?.name || 'All Formats'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.settlement_status)}`}>
                          {getStatusIcon(expense.settlement_status)}
                          <span className="ml-1">{expense.settlement_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense && (expense as unknown as { created_at?: string }).created_at ? formatDate((expense as unknown as { created_at: string }).created_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {expense.settlement_status === 'Not Settled' && (
                          <button
                            onClick={() => handleSettleExpense(expense.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark as Settled
                          </button>
                        )}
                        {expense.settlement_status === 'Settled' && expense.settlement_date && (
                          <span className="text-gray-500">
                            Settled on {formatDate(expense.settlement_date)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.created_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.last_updated_by || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={expense.comments || ''}>
                        {expense.comments || '-'}
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
