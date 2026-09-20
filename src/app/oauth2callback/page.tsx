'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

function OAuth2CallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (errorParam) {
      setSuccess(false);
      setMessage(`Google authorization rejected: ${errorParam}`);
      setLoading(false);
      return;
    }

    if (!code) {
      setSuccess(false);
      setMessage('Missing OAuth code in callback URL.');
      setLoading(false);
      return;
    }

    api
      .exchangeCalendarCode(code)
      .then((res) => {
        setSuccess(res.success);
        setMessage(res.message || 'Google Calendar and Google Meet connected successfully!');
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.message || 'Failed to exchange authorization code.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code, errorParam]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900">Connecting Google Calendar...</h1>
        <p className="text-xs text-slate-500 mt-2">
          Exchanging authorization token and activating Google Meet room creation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
      {success ? (
        <>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Google Calendar Connected</h1>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/dashboard"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
            >
              Return to Home
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Authorization Notice</h1>
          <p className="text-sm text-red-600 mb-6">{message}</p>
          <Link
            href="/"
            className="w-full inline-block py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold"
          >
            Return to Home
          </Link>
        </>
      )}
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Processing authorization...</div>}>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
