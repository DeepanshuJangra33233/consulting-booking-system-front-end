'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ArrowRight,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatINR } from '../lib/utils';
import { ServiceEntity } from '../types';

export default function HomePage() {
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Direct Strategic & Architecture Advisory
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Scale Your Vision with <span className="text-blue-600 dark:text-blue-400">Expert Consulting</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Book high-impact advisory sessions directly on the calendar. Instant slots, seamless Razorpay payments, and automated Google Meet calendar invites.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm transition"
              >
                Browse Services
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-10 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-Time Slots</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Instant</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Google Meet Link</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">4.9 / 5</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Client Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Live Availability Engine</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Slots are calculated in real time against consultant working hours, duration, and blocked dates with atomic double-booking lock.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Google Calendar & Meet</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Upon payment confirmation, a Google Calendar invite is dispatched with an automatic Google Meet link and agenda notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Razorpay Payments</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Seamless payments via UPI, Debit/Credit Cards, and Netbanking powered by Razorpay with instant verification and receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Featured Consultation Offerings
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Select the format that best accelerates your goals. Every session includes personalized preparation and follow-up notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      {svc.durationMinutes} Minutes
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {formatINR(svc.price)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{svc.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  <ul className="space-y-2 mb-8 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      1-on-1 Dedicated Video Meeting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Actionable Roadmap & Notes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      Calendar Invite + Google Meet link
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/book?serviceId=${svc.id}`}
                  className="w-full py-3 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-xl transition"
                >
                  Select & Schedule
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to solve your technical bottlenecks?
          </h2>
          <p className="text-blue-100 text-base max-w-xl mx-auto">
            Reserve an available date and time slot in under 2 minutes. Receive instant calendar invites and conference link.
          </p>
          <div className="pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl shadow hover:bg-blue-50 transition"
            >
              <span>Schedule Your Session</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
