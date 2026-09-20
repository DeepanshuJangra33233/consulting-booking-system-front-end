'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatINR } from '../../../lib/utils';
import { BookingEntity, BookingStatus } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminBookingsPage() {
  const { role } = useAuth();
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingEntity | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminBookings({
        search: search || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      });
      setBookings(res);
    } catch (err: any) {
      console.error('Error fetching admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchBookings();
    }
  }, [role, statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    try {
      await api.updateAdminBooking(id, { status: newStatus });
      await fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-600">
        Admin authorization required.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultation Bookings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            View, filter, complete, or cancel appointments across all services.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, customer name, email, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none"
          />

          {(search || statusFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table (Section 32) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No bookings match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.customer.name}</div>
                      <div className="text-[11px] text-slate-400">{b.customer.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{b.serviceName}</td>
                    <td className="py-3.5 px-4">{b.schedule.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {b.schedule.startTime} - {b.schedule.endTime}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatINR(b.amount)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          b.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.paymentStatus === 'refunded'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          b.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700'
                            : b.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      {b.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'completed')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold transition"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                            className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-bold transition"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-blue-600 font-extrabold">{selectedBooking.bookingNumber}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedBooking.serviceName}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Date & Time:</span>
                  <span className="font-bold text-slate-800">{selectedBooking.schedule.date}</span>
                  <span className="block text-slate-500">{selectedBooking.schedule.startTime} - {selectedBooking.schedule.endTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Amount / Status:</span>
                  <span className="font-bold text-slate-800">{formatINR(selectedBooking.amount)}</span>
                  <span className="block capitalize font-semibold text-blue-600">{selectedBooking.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Customer Details:</span>
                <p className="font-bold text-slate-800">{selectedBooking.customer.name}</p>
                <p>{selectedBooking.customer.email} • {selectedBooking.customer.phone}</p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Meeting Agenda:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg italic text-slate-700 border border-slate-200">
                  {selectedBooking.customer.agenda}
                </p>
              </div>

              {selectedBooking.meetingUrl && (
                <div>
                  <span className="text-slate-400 block font-semibold">Google Meet:</span>
                  <a
                    href={selectedBooking.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Video className="w-3.5 h-3.5" /> {selectedBooking.meetingUrl}
                  </a>
                </div>
              )}

              {selectedBooking.googleCalendarEventId && (
                <div className="text-[11px] text-slate-400">
                  Calendar Event ID: {selectedBooking.googleCalendarEventId}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
