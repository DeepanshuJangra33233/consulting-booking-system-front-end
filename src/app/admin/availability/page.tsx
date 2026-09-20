'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, ArrowLeft, Check, Loader2, Save } from 'lucide-react';
import { api } from '../../../lib/api';
import { AvailabilityWorkingHours } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminAvailabilityPage() {
  const { role } = useAuth();
  const [schedule, setSchedule] = useState<AvailabilityWorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<number | null>(null);

  useEffect(() => {
    if (role === 'admin') {
      api
        .getWorkingHours()
        .then((data) => setSchedule(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [role]);

  const handleToggle = (idx: number) => {
    const updated = [...schedule];
    updated[idx].enabled = !updated[idx].enabled;
    setSchedule(updated);
  };

  const handleTimeChange = (idx: number, field: 'startTime' | 'endTime', val: string) => {
    const updated = [...schedule];
    updated[idx][field] = val;
    setSchedule(updated);
  };

  const handleSaveDay = async (idx: number) => {
    try {
      setSavingIndex(idx);
      await api.updateWorkingHours(schedule[idx]);
      setSavedSuccess(idx);
      setTimeout(() => setSavedSuccess(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Error updating working hours');
    } finally {
      setSavingIndex(null);
    }
  };

  if (role !== 'admin') {
    return <div className="max-w-md mx-auto py-20 text-center">Admin authorization required.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/admin/dashboard"
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Working Hours & Availability Schedule
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Define standard daily hours for generating client booking slots.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            Loading working hours...
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  day.enabled ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.enabled}
                    onChange={() => handleToggle(idx)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <label htmlFor={`day-${day.dayOfWeek}`} className="font-bold text-sm text-slate-900 cursor-pointer">
                    {day.dayName}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">From:</span>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.startTime}
                    onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500">To:</span>
                  <input
                    type="time"
                    disabled={!day.enabled}
                    value={day.endTime}
                    onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end w-28">
                  <button
                    onClick={() => handleSaveDay(idx)}
                    disabled={savingIndex === idx}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {savingIndex === idx ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : savedSuccess === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savedSuccess === idx ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
