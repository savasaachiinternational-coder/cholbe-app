import {apiRequest} from './client';

export type Doctor = {
  id: string;
  specialty: string;
  degree: string | null;
  fee: string | number;
  categories: string[];
  imageUrl: string | null;
  isOnline: boolean;
  user: { id: string; fullName: string; avatarUrl: string | null };
};

export const doctorsApi = {
  list(params?: { search?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return apiRequest<Doctor[]>(`/doctors${query ? `?${query}` : ''}`);
  },

  getById(id: string) {
    return apiRequest<Doctor>(`/doctors/${id}`);
  },
};
