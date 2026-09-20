'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Calendar, ShieldCheck, User, LogOut, Briefcase } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, loginAsDev } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Consult<span className="text-blue-600 dark:text-blue-400">Sync</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/services"
              className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname.startsWith('/services') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Services
            </Link>
            <Link
              href="/book"
              className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                pathname === '/book' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Book Now
            </Link>
            {user && (
              <Link
                href="/dashboard/bookings"
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  pathname.startsWith('/dashboard') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                My Bookings
              </Link>
            )}
            {role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{role}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                Sign In
              </Link>
              <Link
                href="/book"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition"
              >
                Book Consultation
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
