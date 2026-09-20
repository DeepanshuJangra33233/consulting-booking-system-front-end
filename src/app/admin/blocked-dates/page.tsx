'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';
import { BlockedDateEntity } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminBlockedDatesPage() {
  const { role } = useAuth();
  const [blockedDates, setBlockedDates] = useState<BlockedDateEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBlocked = async () => {
    try {
      setLoading(true);
      const list = await api.getBlockedDates();
      setBlockedDates(list);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchBlocked();
    }
  }, [role]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    try {
      setSubmitting(true);
      await api.addBlockedDate({ date: newDate, reason });
      setNewDate('');
      setReason('');
      await fetchBlocked();
    } catch (err: any) {
      alert(err.message || 'Error blocking date');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Unblock this date? Clients will be able to book slots on this date again.')) return;
    try {
      await api.removeBlockedDate(id);
      await fetchBlocked();
    } catch (err: any) {
      alert(err.message || 'Error unblocking date');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (role !== 'admin') {
    return <div className="max-w-md mx-auto py-20 text-center">Admin authorization required.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/admin/dashboard"
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Blocked Dates & Holidays
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Mark full calendar days as unavailable for client consultations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Block a New Date
          </h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calendar Date *</label>
              <input
                type="date"
                required
                min={today}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Note</label>
              <input
                type="text"
                placeholder="e.g. National Holiday, Travel, Offsite..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? 'Blocking Date...' : 'Block Selected Date'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Current Blocked Dates</h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Loading blocked dates...
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No dates are currently blocked. Clients can book any standard working day.
            </div>
          ) : (
            <div className="space-y-3">
              {blockedDates.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        {formatDate(b.date)} ({b.date})
                      </span>
                      <span className="text-xs text-slate-500">{b.reason || 'Blocked by Admin'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(b.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Unblock date"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
