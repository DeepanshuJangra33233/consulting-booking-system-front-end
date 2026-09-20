'use client';

import React from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ProfilePage() {
  const { user, role, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-500 text-xs">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-400 capitalize">{role} Account</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-6 mb-8 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Email Address</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">User Role</span>
            <span className="font-semibold text-blue-600 capitalize">{role}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Timezone</span>
            <span className="font-semibold text-slate-800">Asia/Kolkata (IST)</span>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
