'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatINR } from '../../../lib/utils';
import { ServiceEntity } from '../../../types';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [service, setService] = useState<ServiceEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api
      .getServiceBySlug(slug)
      .then((data) => setService(data))
      .catch((err) => setError(err.message || 'Service not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading service details...
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Service Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Could not find the requested service.'}</p>
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/services" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to all services
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Clock className="w-3.5 h-3.5" />
              {service.durationMinutes} Minutes Session
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{service.name}</h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Total Fee</span>
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{formatINR(service.price)}</span>
          </div>
        </div>

        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">About this session</h2>
          <p className="text-base text-slate-600 dark:text-slate-400">{service.description}</p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 pt-4">
            Key Outcomes & Inclusions
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              Direct 1-on-1 strategic consultation
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              Automated Google Meet video room
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              Direct sync into your Google Calendar
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              Actionable summary document
            </li>
          </ul>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cancellation is free up to 24 hours prior to scheduled appointment.
          </p>
          <Link
            href={`/book?serviceId=${service.id}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Slot Selection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
