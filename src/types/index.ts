export type UserRole = 'user' | 'admin' | 'customer';

export type BookingStatus =
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface UserEntity {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: 'INR';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedTime: string;
  available: boolean;
  reason?: string;
}

export interface BookingEntity {
  id: string;
  bookingNumber: string;
  userId?: string;
  serviceId: string;
  serviceName?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    agenda: string;
  };
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  amount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  googleCalendarEventId?: string;
  meetingUrl?: string;
  confirmationEmailSent: boolean;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface AvailabilityWorkingHours {
  dayOfWeek: number;
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface BlockedDateEntity {
  id: string;
  date: string;
  reason?: string;
  createdAt: string;
}

export interface AdminAnalytics {
  metrics: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    pendingPayments: number;
    totalRevenue: number;
    totalUsers?: number;
    currency: string;
  };
  recentBookings: BookingEntity[];
}

export interface AdminCustomer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  createdAt?: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
}
