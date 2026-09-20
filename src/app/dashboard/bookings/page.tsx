'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatINR } from '../../../lib/utils';
import { BookingEntity } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const list = await api.getMyBookings();
      setBookings(list);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancel = async (id: string) => {
    setActionError(null);
    try {
      await api.cancelBooking(id, cancelReason || 'Cancelled by user');
      setCancellingId(null);
      setCancelReason('');
      await fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel booking');
    }
  };

  const isMeetingActive = (schedule: BookingEntity['schedule']) => {
    try {
      const now = new Date();
      const [year, month, day] = schedule.date.split('-').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const endDate = new Date(year, month - 1, day, endH, endM);

      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const startDate = new Date(year, month - 1, day, startH, startM);

      const isOver = now.getTime() > endDate.getTime();
      const isLive = now.getTime() >= startDate.getTime() && now.getTime() <= endDate.getTime();
      const isUpcoming = now.getTime() < startDate.getTime();

      return { isOver, isLive, isUpcoming };
    } catch (_) {
      return { isOver: false, isLive: true, isUpcoming: false };
    }
  };

  const upcomingBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    const { isOver } = isMeetingActive(b.schedule);
    return !isOver;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return true;
    const { isOver } = isMeetingActive(b.schedule);
    return isOver || b.status === 'completed';
  });

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Customer Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
            Please sign in to your account to view your scheduled consultations and Google Meet invites.
          </p>
          <Link
            href="/login"
            className="w-full block py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Consultations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage your booked sessions, join video calls, and access meeting notes.
          </p>
        </div>
        <Link
          href="/book"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          Book New Consultation
        </Link>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative ${
            activeTab === 'upcoming'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming Sessions ({upcomingBookings.length})
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative ${
            activeTab === 'past'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Past & Cancelled ({pastBookings.length})
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading your consultations...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No {activeTab} bookings found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            You don't have any {activeTab} consulting appointments scheduled.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Schedule a Consultation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((booking) => {
            const meetingState = isMeetingActive(booking.schedule);
            const fallbackUrl = `https://meet.jit.si/ConsultingSession-${(booking.bookingNumber || booking.id).replace(/[^a-zA-Z0-9]/g, '')}`;
            const activeMeetUrl = booking.meetingUrl || fallbackUrl;
            const isConfirmed = booking.status === 'confirmed';

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                  meetingState.isLive && isConfirmed
                    ? 'border-emerald-500/50 dark:border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {booking.bookingNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : booking.status === 'completed'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>

                    {/* Live in-progress indicator */}
                    {meetingState.isLive && isConfirmed && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Now • Active Call
                      </span>
                    )}

                    {/* Concluded indicator */}
                    {meetingState.isOver && isConfirmed && (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        Meeting Concluded
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium">
                      {formatINR(booking.amount)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{booking.serviceName}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(booking.schedule.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {booking.schedule.startTime} - {booking.schedule.endTime} ({booking.schedule.timezone})
                    </span>
                  </div>

                  {booking.customer.agenda && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 max-w-xl">
                      <strong className="text-slate-700 dark:text-slate-200">Agenda:</strong> {booking.customer.agenda}
                    </p>
                  )}

                  {/* Guaranteed Direct Meeting Link */}
                  {isConfirmed && (
                    <div className="flex items-center gap-2 pt-1">
                      <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Video Link:</span>
                      <a
                        href={activeMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs sm:max-w-md inline-flex items-center gap-1"
                      >
                        {activeMeetUrl}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Primary Join Action Button for confirmed sessions */}
                  {isConfirmed && (
                    <a
                      href={activeMeetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm transition ${
                        meetingState.isLive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 animate-pulse'
                          : meetingState.isOver
                          ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>
                        {meetingState.isLive
                          ? 'Join Video Call (Live Now)'
                          : meetingState.isOver
                          ? 'Re-open Meeting Link'
                          : 'Join / Open Video Call'}
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {isConfirmed && !meetingState.isOver && (
                    <button
                      onClick={() => setCancellingId(booking.id)}
                      className="px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold transition"
                    >
                      Cancel Session
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cancel Consultation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Note: Cancellations must be submitted at least <strong>24 hours</strong> before the scheduled appointment time.
            </p>

            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for cancellation</label>
            <textarea
              rows={3}
              placeholder="e.g. Schedule conflict with client presentation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs mb-6 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCancellingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancel(cancellingId)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
