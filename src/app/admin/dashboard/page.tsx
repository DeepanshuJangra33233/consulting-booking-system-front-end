'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatINR } from '../../../lib/utils';
import { AdminAnalytics } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, role, loginAsDev } = useAuth();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role === 'admin') {
      api
        .getAdminDashboard()
        .then((res) => setData(res))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Admin Portal Access</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
            You must be authenticated as an Admin to view platform analytics and manage services.
          </p>
          <button
            onClick={() => loginAsDev('admin')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            One-Click Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading analytics & KPIs...</p>
      </div>
    );
  }

  const m = data?.metrics || {
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    currency: 'INR',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Overview
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
              Admin
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Monitor real-time bookings, availability, confirmed revenue, and consultant schedule.
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/bookings"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Manage Bookings
          </Link>
          <Link
            href="/admin/services"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Services
          </Link>
          <Link
            href="/admin/availability"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Working Hours
          </Link>
          <Link
            href="/admin/blocked-dates"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Blocked Dates
          </Link>
          <Link
            href="/admin/customers"
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Customers
          </Link>
        </div>
      </div>

      {/* KPI Cards (Section 31) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 text-xs font-medium block">Total Bookings</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
            {m.totalBookings}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 text-xs font-medium block">Upcoming</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
            {m.upcomingBookings}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 text-xs font-medium block">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {m.completedBookings}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 text-xs font-medium block">Cancelled</span>
          <span className="text-2xl font-extrabold text-red-500 dark:text-red-400 mt-1 block">
            {m.cancelledBookings}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-400 text-xs font-medium block">Pending Pay</span>
          <span className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-1 block">
            {m.pendingPayments}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-xs font-medium block">Total Revenue</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
            {formatINR(m.totalRevenue)}
          </span>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Bookings</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Latest customer appointments created</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!data?.recentBookings || data.recentBookings.length === 0 ? (
          <p className="text-slate-400 text-xs py-8 text-center">No bookings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{b.customer.name}</div>
                      <div className="text-[11px] text-slate-400">{b.customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4">{b.serviceName}</td>
                    <td className="py-3.5 px-4">
                      <div>{b.schedule.date}</div>
                      <div className="text-[11px] text-slate-400">{b.schedule.startTime}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{formatINR(b.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          b.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          b.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
