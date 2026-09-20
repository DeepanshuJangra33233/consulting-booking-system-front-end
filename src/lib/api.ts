import {
  AdminAnalytics,
  AdminCustomer,
  AvailabilityWorkingHours,
  BlockedDateEntity,
  BookingEntity,
  ServiceEntity,
  TimeSlot,
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const errorMsg = json.message || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg) as any;
      err.code = json.code;
      err.errors = json.errors;
      throw err;
    }

    return json.data !== undefined ? json.data : json;
  }

  // --- Services ---
  async getServices(): Promise<ServiceEntity[]> {
    return this.request<ServiceEntity[]>('/services');
  }

  async getServiceBySlug(slug: string): Promise<ServiceEntity> {
    return this.request<ServiceEntity>(`/services/${slug}`);
  }

  async createService(data: Partial<ServiceEntity>): Promise<ServiceEntity> {
    return this.request<ServiceEntity>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<ServiceEntity>): Promise<ServiceEntity> {
    return this.request<ServiceEntity>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.request<{ id: string; deleted: boolean }>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Availability & Slots ---
  async getSlots(
    date: string,
    serviceId: string,
    timezone = 'Asia/Kolkata',
  ): Promise<{
    date: string;
    dayName: string;
    isBlocked: boolean;
    blockedReason?: string;
    slots: TimeSlot[];
  }> {
    return this.request(
      `/availability/slots/${date}?serviceId=${serviceId}&timezone=${encodeURIComponent(timezone)}`,
    );
  }

  async getWorkingHours(): Promise<AvailabilityWorkingHours[]> {
    return this.request<AvailabilityWorkingHours[]>('/availability/working-hours');
  }

  async updateWorkingHours(data: AvailabilityWorkingHours): Promise<AvailabilityWorkingHours> {
    return this.request<AvailabilityWorkingHours>('/availability/working-hours', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBlockedDates(): Promise<BlockedDateEntity[]> {
    return this.request<BlockedDateEntity[]>('/availability/blocked-dates');
  }

  async addBlockedDate(data: { date: string; reason?: string }): Promise<BlockedDateEntity> {
    return this.request<BlockedDateEntity>('/availability/blocked-dates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeBlockedDate(id: string): Promise<{ id: string; deleted: boolean }> {
    return this.request<{ id: string; deleted: boolean }>(`/availability/blocked-dates/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Bookings ---
  async createBooking(data: {
    serviceId: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      agenda: string;
    };
    schedule: {
      date: string;
      startTime: string;
      timezone: string;
    };
  }): Promise<BookingEntity> {
    return this.request<BookingEntity>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBooking(id: string): Promise<BookingEntity> {
    return this.request<BookingEntity>(`/bookings/${id}`);
  }

  async getMyBookings(): Promise<BookingEntity[]> {
    return this.request<BookingEntity[]>('/bookings/me');
  }

  async cancelBooking(id: string, reason?: string): Promise<BookingEntity> {
    return this.request<BookingEntity>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // --- Payments (Razorpay) ---
  async createRazorpayOrder(bookingId: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    bookingId: string;
    bookingNumber: string;
    serviceName: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    checkoutUrl: string;
    mode: 'live' | 'mock';
  }> {
    return this.request('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  // Alias for backward compatibility
  async createCheckoutSession(bookingId: string) {
    return this.createRazorpayOrder(bookingId);
  }

  async verifyRazorpayPayment(data: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<BookingEntity> {
    return this.request<BookingEntity>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(bookingId: string): Promise<any> {
    return this.request(`/payments/${bookingId}`);
  }

  async simulatePaymentSuccess(bookingId: string): Promise<BookingEntity> {
    return this.request<BookingEntity>(`/webhooks/razorpay/simulate-success/${bookingId}`, {
      method: 'POST',
    });
  }

  // --- Admin ---
  async getAdminDashboard(): Promise<AdminAnalytics> {
    return this.request<AdminAnalytics>('/admin/dashboard');
  }

  async getAdminBookings(params?: {
    status?: string;
    date?: string;
    search?: string;
  }): Promise<BookingEntity[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.date) query.set('date', params.date);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return this.request<BookingEntity[]>(`/admin/bookings${qs ? `?${qs}` : ''}`);
  }

  async updateAdminBooking(id: string, data: any): Promise<BookingEntity> {
    return this.request<BookingEntity>(`/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminCustomers(): Promise<AdminCustomer[]> {
    return this.request<AdminCustomer[]>('/admin/customers');
  }
}

export const api = new ApiClient();
