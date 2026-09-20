'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { ServiceEntity } from '../../types';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getServices()
      .then((data) => setServices(data))
      .catch((err) => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Consulting Services & Advisory
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400 text-base">
          Direct, high-impact sessions tailored to solve architectural bottlenecks, guide strategic tech choices, and optimize software engineering teams.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-sm">
          Loading consulting offerings...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {svc.durationMinutes} Minutes
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatINR(svc.price)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{svc.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {svc.description}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mb-8">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">
                    What is included
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      1-on-1 private video meeting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Instant Google Meet link & Calendar invite
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Written notes & actionable summary
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Flexible 24-hour cancellation policy
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href={`/book?serviceId=${svc.id}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>Book This Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/services/${svc.slug}`}
                  className="w-full block py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
