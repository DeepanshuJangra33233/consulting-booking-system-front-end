'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

function BookingCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">Checkout Cancelled</h1>
        <p className="text-slate-500 text-xs leading-relaxed mb-6">
          Your payment was not completed, and your card was not charged. The temporary reservation will automatically expire if not completed.
        </p>

        <div className="space-y-2.5">
          <Link
            href="/book"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Select Another Slot</span>
          </Link>
          <Link
            href="/"
            className="w-full block py-2.5 text-slate-600 hover:text-slate-900 font-medium text-xs transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 text-sm">
          Loading...
        </div>
      }
    >
      <BookingCancelContent />
    </Suspense>
  );
}

