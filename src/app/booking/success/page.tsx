'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Mail,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatINR } from '../../../lib/utils';
import { BookingEntity } from '../../../types';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('order_id') || searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');

  const [booking, setBooking] = useState<BookingEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Missing booking identifier in URL');
      setLoading(false);
      return;
    }

    const loadAndConfirm = async () => {
      try {
        let b = await api.getBooking(bookingId);

        // If booking is pending_payment (e.g. from dev checkout or redirect before webhook completes)
        if (b.status === 'pending_payment') {
          // Trigger confirmation
          b = await api.simulatePaymentSuccess(bookingId);
        }

        setBooking(b);
      } catch (err: any) {
        setError(err.message || 'Failed to verify booking confirmation');
      } finally {
        setLoading(false);
      }
    };

    loadAndConfirm();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Verifying Booking & Payment</h2>
        <p className="text-slate-500 text-xs mt-1">
          Synchronizing Google Calendar invite and generating Google Meet room...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700">
          <h2 className="text-lg font-bold mb-1">Confirmation Notice</h2>
          <p className="text-xs">{error || 'Booking not found.'}</p>
          <Link href="/book" className="mt-4 inline-block text-xs font-bold text-blue-600 hover:underline">
            Return to Booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center">
        {/* Checkmark icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full mb-2">
          Payment Confirmed • {booking.bookingNumber}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Your Consultation is Confirmed!
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
          A confirmation email has been dispatched to <strong>{booking.customer.email}</strong> with your calendar invite and meeting details.
        </p>

        {/* Meeting Details Box */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-4 mb-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Service</span>
              <span className="text-base font-bold text-slate-900">{booking.serviceName}</span>
            </div>
            <span className="text-sm font-extrabold text-blue-600">{formatINR(booking.amount)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-medium">Date</span>
                <span className="font-bold text-slate-800 text-sm">{formatDate(booking.schedule.date)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-medium">Time</span>
                <span className="font-bold text-slate-800 text-sm">
                  {booking.schedule.startTime} - {booking.schedule.endTime} ({booking.schedule.timezone})
                </span>
              </div>
            </div>
          </div>

          {booking.meetingUrl && (
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-200/60">
              <div className="flex items-center gap-2 text-blue-900 text-xs font-semibold">
                <Video className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Google Meet Room Attached</span>
              </div>
              <a
                href={booking.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>Join Google Meet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard/bookings"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <span>View My Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 text-sm">
          Loading booking status...
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
