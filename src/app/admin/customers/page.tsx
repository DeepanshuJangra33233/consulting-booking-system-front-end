'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Mail, Phone, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate, formatINR } from '../../../lib/utils';
import { AdminCustomer } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminCustomersPage() {
  const { role } = useAuth();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'admin') {
      api
        .getAdminCustomers()
        .then((res) => setCustomers(res))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [role]);

  if (role !== 'admin') {
    return <div className="max-w-md mx-auto py-20 text-center">Admin authorization required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/admin/dashboard"
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Client Directory
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Clients who have scheduled or paid for consulting sessions.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading clients...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No customers found. Bookings created will automatically aggregate clients here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Last Consultation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.email} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.totalBookings} session{c.totalBookings > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      {formatINR(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(c.lastBookingDate)}
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
