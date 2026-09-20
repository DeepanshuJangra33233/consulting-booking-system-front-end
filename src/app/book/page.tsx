'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/utils';
import { ServiceEntity, TimeSlot } from '../../types';
import { useAuth } from '../../context/AuthContext';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('serviceId') || '';
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/book');
    }
  }, [user, authLoading, router]);

  // Multi-step states: 1 = Service, 2 = Date, 3 = Time, 4 = Details, 5 = Review
  const [step, setStep] = useState<number>(1);

  // Data states
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceEntity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockedReason, setBlockedReason] = useState<string>('');

  // Form details
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91',
    agenda: '',
  });

  // UI state
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync user info when available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Load services
  useEffect(() => {
    api
      .getServices()
      .then((data) => {
        setServices(data);
        if (initialServiceId) {
          const matched = data.find((s) => s.id === initialServiceId);
          if (matched) {
            setSelectedService(matched);
            setStep(2);
          }
        }
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoadingServices(false));
  }, [initialServiceId]);

  // Load slots when date or service changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return;

    setLoadingSlots(true);
    setErrorMessage(null);
    setSelectedSlot(null);

    api
      .getSlots(selectedDate, selectedService.id, 'Asia/Kolkata')
      .then((res) => {
        setIsBlocked(res.isBlocked);
        setBlockedReason(res.blockedReason || '');
        setSlots(res.slots || []);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Failed to fetch slots');
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService]);

  // Compute minimum selectable date (tomorrow or today)
  const today = new Date().toISOString().split('T')[0];

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1 && !selectedService) {
      setErrorMessage('Please choose a consulting service.');
      return;
    }
    if (step === 2 && !selectedDate) {
      setErrorMessage('Please choose a consultation date.');
      return;
    }
    if (step === 3 && !selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }
    if (step === 4) {
      if (!user) {
        setErrorMessage('Please sign in to your account before proceeding to payment.');
        router.push('/login');
        return;
      }
      if (!formData.name.trim() || formData.name.length < 2) {
        setErrorMessage('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!formData.phone.trim() || formData.phone.length < 8) {
        setErrorMessage('Please enter a valid contact phone number.');
        return;
      }
      if (!formData.agenda.trim() || formData.agenda.length < 10) {
        setErrorMessage('Please provide meeting agenda notes (at least 10 characters).');
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit Booking and Launch Razorpay Checkout
  const handleProceedToPayment = async () => {
    if (!user) {
      setErrorMessage('Please sign in to your account before proceeding to payment.');
      router.push('/login');
      return;
    }

    if (!selectedService || !selectedSlot || !selectedDate) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Create Pending Booking with Double Booking Lock
      const booking = await api.createBooking({
        serviceId: selectedService.id,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          agenda: formData.agenda,
        },
        schedule: {
          date: selectedDate,
          startTime: selectedSlot.startTime,
          timezone: 'Asia/Kolkata',
        },
      });

      // 2. Initiate Razorpay Order
      const orderData = await api.createRazorpayOrder(booking.id);
      const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 3. Fallback only if mock mode and no valid key
      if (orderData.mode === 'mock' && (!razorpayKey || razorpayKey.includes('mock'))) {
        const proceedMock = window.confirm(
          `Demo Payment Gateway: Proceed to simulate test payment confirmation for ${orderData.serviceName}?`
        );
        if (proceedMock) {
          window.location.href = orderData.checkoutUrl;
        } else {
          setSubmitting(false);
        }
        return;
      }

      // 4. Launch Razorpay Standard Checkout Popup
      const loaded = await loadRazorpayScript();
      if (!loaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Failed to load Razorpay payment gateway. Please check your network connection.');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Consulting Advisory',
        description: orderData.serviceName,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.phone,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response: any) => {
          try {
            await api.verifyRazorpayPayment({
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            window.location.href = `/booking/success?booking_id=${booking.id}&payment_id=${response.razorpay_payment_id}`;
          } catch (verifyErr: any) {
            setErrorMessage(verifyErr.message || 'Payment verification failed.');
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (failResponse: any) => {
        setErrorMessage(failResponse.error?.description || 'Payment transaction failed.');
        setSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || 'Slot reservation failed. Please choose another slot.');
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book a Consulting Session
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete the steps below to reserve your slot and generate meeting coordinates.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 text-xs font-semibold">
        {[
          { num: 1, label: 'Service' },
          { num: 2, label: 'Date' },
          { num: 3, label: 'Time' },
          { num: 4, label: 'Details' },
          { num: 5, label: 'Review' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step === s.num
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={step >= s.num ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}>
                {s.label}
              </span>
            </div>
            {idx < 4 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Card Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Step 1: Select Service</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Choose the consultation offering that fits your agenda.</p>

            {loadingServices ? (
              <div className="py-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Loading available offerings...
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      selectedService?.id === svc.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-base">{svc.name}</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                          {svc.durationMinutes} mins
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{svc.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{formatINR(svc.price)}</span>
                      <div className="mt-1">
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center border ${
                            selectedService?.id === svc.id
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {selectedService?.id === svc.id && <Check className="w-3 h-3" />}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Date */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Step 2: Select Date</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              Select your preferred appointment date. Standard availability is Monday - Friday.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Appointment Date (YYYY-MM-DD)</label>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Tip: Timezone is calibrated to <strong>Asia/Kolkata (IST)</strong>.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Select Available Time Slot */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 3: Choose Time Slot</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Available intervals for {selectedDate} ({selectedService?.durationMinutes} min session)
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
                Asia/Kolkata
              </span>
            </div>

            {loadingSlots ? (
              <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Calculating live slot availability...
              </div>
            ) : isBlocked ? (
              <div className="p-8 text-center bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm">Date Unavailable</h3>
                <p className="text-xs mt-1">{blockedReason || 'This date is blocked for bookings.'}</p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Choose another date
                </button>
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-500 dark:text-slate-400">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">No working hours available on this date.</p>
                <p className="text-xs text-slate-400 mt-1">{blockedReason || 'Consultant is off on this day.'}</p>
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Pick a different date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      !slot.available
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : selectedSlot?.startTime === slot.startTime
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-xs font-bold">{slot.startTime} - {slot.endTime}</span>
                    <span className="text-[10px]">
                      {slot.available ? 'Available' : slot.reason || 'Booked'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Customer Details Form */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Step 4: Customer Information</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              Provide your contact coordinates and agenda to brief the consultant.
            </p>

            {!user && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Account Sign In Required</h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    You must sign in to your account before finalizing and paying for a consultation.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap"
                >
                  Sign In to Continue
                </Link>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Agenda & Topic Discussion *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your goals, system architecture questions, or current blockers..."
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Checkout */}
        {step === 5 && selectedService && selectedSlot && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Step 5: Review Booking Details</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              Review your appointment summary before proceeding to Razorpay checkout.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedService.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedService.durationMinutes} Minutes Consultation</p>
                </div>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {formatINR(selectedService.price)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300 py-2">
                <div>
                  <span className="text-slate-400 block font-medium">Scheduled Date & Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">
                    {selectedDate} at {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                  <span className="text-[11px] text-slate-400">Timezone: Asia/Kolkata</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Customer Coordinates</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">
                    {formData.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{formData.email} • {formData.phone}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-slate-400 block font-medium text-xs">Agenda:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-1 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  "{formData.agenda}"
                </p>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Total Due Today</span>
                <span className="font-extrabold text-2xl text-slate-900 dark:text-white">
                  {formatINR(selectedService.price)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Your slot is reserved for 20 minutes upon proceeding to Razorpay Checkout.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleProceedToPayment}
              className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reserving Slot & Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment ({formatINR(selectedService?.price || 0)})</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-500 text-sm">
          Loading booking form...
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
