import {apiRequest} from './client';

export type Medicine = {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  brand: string | null;
  status: string;
  imageUrl: string | null;
};

export const medicinesApi = {
  list(params?: { search?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return apiRequest<Medicine[]>(`/medicines${query ? `?${query}` : ''}`);
  },
};
