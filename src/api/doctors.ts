import {apiRequest} from './client';

export type Doctor = {
  id: string;
  specialty: string;
  degree: string | null;
  fee: string | number;
  categories: string[];
  imageUrl: string | null;
  isOnline: boolean;
  specialtyRef?: { id: string; name: string; slug: string } | null;
  user: { id: string; fullName: string; avatarUrl: string | null };
  reviewAverage?: number;
  reviewCount?: number;
};

export type DoctorReviews = {
  averageRating: number;
  totalReviews: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    patient: { fullName: string; avatarUrl: string | null };
  }>;
};

export type DoctorAvailabilityDate = {
  date: string;
  available: boolean;
};

export type DoctorAvailabilitySlots = {
  date: string;
  available: boolean;
  slots: string[];
};

export const doctorsApi = {
  list(params?: { search?: string; category?: string; specialtyId?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.specialtyId) qs.set('specialtyId', params.specialtyId);
    const query = qs.toString();
    return apiRequest<Doctor[]>(`/doctors${query ? `?${query}` : ''}`);
  },

  getById(id: string) {
    return apiRequest<Doctor>(`/doctors/${id}`);
  },

  availableDates(doctorId: string, from?: string, days = 14) {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    qs.set('days', String(days));
    return apiRequest<DoctorAvailabilityDate[]>(
      `/doctors/${doctorId}/availability/dates?${qs.toString()}`,
    );
  },

  availableSlots(doctorId: string, date: string) {
    return apiRequest<DoctorAvailabilitySlots>(
      `/doctors/${doctorId}/availability?date=${encodeURIComponent(date)}`,
    );
  },

  reviews(doctorId: string, limit = 20) {
    return apiRequest<DoctorReviews>(`/doctors/${doctorId}/reviews?limit=${limit}`);
  },
};
