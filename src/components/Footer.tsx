import React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>ConsultSync</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm">
              Production-grade strategic advisory and architecture consulting. Seamless booking, instant Google Calendar invites, and direct Google Meet sessions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">Consulting</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services" className="hover:text-blue-600 dark:hover:text-blue-400">Services Catalog</Link></li>
              <li><Link href="/book" className="hover:text-blue-600 dark:hover:text-blue-400">Book Appointment</Link></li>
              <li><Link href="/dashboard/bookings" className="hover:text-blue-600 dark:hover:text-blue-400">Customer Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider mb-3">Admin</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/admin/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Admin Dashboard</Link></li>
              <li><Link href="/admin/bookings" className="hover:text-blue-600 dark:hover:text-blue-400">Manage Bookings</Link></li>
              <li><Link href="/admin/availability" className="hover:text-blue-600 dark:hover:text-blue-400">Working Hours</Link></li>
              <li><Link href="/admin/blocked-dates" className="hover:text-blue-600 dark:hover:text-blue-400">Blocked Dates</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} ConsultSync Platform. All rights reserved.</p>
          <p>Timezone: Asia/Kolkata (IST)</p>
        </div>
      </div>
    </footer>
  );
}
