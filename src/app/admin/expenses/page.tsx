'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DollarSign, Receipt, ArrowLeft, Users, FileText } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { useSession } from 'next-auth/react';
import { getUserPermissions, UserRole } from '@/lib/permissions';

export default function ExpenseManagementPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ pendingMember: 0, pendingExpenses: 0 });
  const currentYear = new Date().getFullYear();
  const formatSeason = (startYear: number) => `${startYear}-${startYear + 1}`;

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [duesRes, expensesRes] = await Promise.all([
          fetch(`/api/member-dues?year=${currentYear}`),
          fetch(`/api/general-expenses?year=${currentYear}`)
        ]);
        const duesData = await duesRes.json();
        const expensesData = await expensesRes.json();

        const pendingMember = duesRes.ok ? (duesData.totals?.pending_dues || 0) : 0;
        const pendingExpenses = expensesRes.ok ? (expensesData.totals?.pending_amount || 0) : 0;

        setTotals({ pendingMember, pendingExpenses });
      } catch (e) {
        setTotals({ pendingMember: 0, pendingExpenses: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchTotals();
  }, []);

  if (!user) {
    return null;
  }

  const userRole = (user as { role?: string })?.role as UserRole || 'viewer';
  const permissions = getUserPermissions(userRole);

  return (
    <AdminGuard requiredRole="viewer">
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
              <p className="mt-2 text-gray-600">
                Manage member dues and general expenses for the club
              </p>
            </div>
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
              ← Back to Admin
            </Link>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member Dues */}
          <Link href="/admin/expenses/member-dues" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow h-full">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <DollarSign className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Member Dues</h3>
                <p className="text-gray-600 mb-4">
                  {permissions.canCreate 
                    ? 'Track yearly dues, payment status, and settlements for club members'
                    : 'View yearly dues, payment status, and settlements for club members'
                  }
                </p>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <Users className="h-4 w-4 mr-2" />
                  {permissions.canCreate ? 'Manage Member Payments' : 'View Member Payments'}
                </div>
              </div>
            </div>
          </Link>

          {/* General Expenses */}
          <Link href="/admin/expenses/general-expenses" className="group">
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow h-full">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <Receipt className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">General Expenses</h3>
                <p className="text-gray-600 mb-4">
                  {permissions.canCreate 
                    ? 'Track umpire fees, equipment, storage, and other club expenses'
                    : 'View umpire fees, equipment, storage, and other club expenses'
                  }
                </p>
                <div className="flex items-center text-sm text-red-600 font-medium">
                  <FileText className="h-4 w-4 mr-2" />
                  {permissions.canCreate ? 'Manage Club Expenses' : 'View Club Expenses'}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Overview</h3>
          <p className="text-sm text-gray-500 mb-4">Season {formatSeason(currentYear)}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totals.pendingMember)}</div>
              <div className="text-sm text-gray-600">Pending Member Dues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totals.pendingExpenses)}</div>
              <div className="text-sm text-gray-600">Pending General Expenses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}