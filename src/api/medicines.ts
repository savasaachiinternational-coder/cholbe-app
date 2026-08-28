import {apiRequest} from './client';
import type {MedicineInfoSection} from '../types/medicineInfo';

export type Medicine = {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  brand: string | null;
  status: string;
  imageUrl: string | null;
  description?: string | null;
  infoSections?: MedicineInfoSection[] | null;
};

export const medicinesApi = {
  list(params?: { search?: string; category?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiRequest<Medicine[]>(`/medicines${query ? `?${query}` : ''}`);
  },

  getOne(id: string) {
    return apiRequest<Medicine>(`/medicines/${id}`);
  },

  update(
    id: string,
    payload: {
      name?: string;
      genericName?: string;
      category?: string;
      brand?: string;
      medicineType?: string;
      description?: string;
      infoSections?: MedicineInfoSection[];
      imageUrl?: string;
      prescriptionRequired?: boolean;
      status?: string;
    },
  ) {
    return apiRequest<Medicine>(`/medicines/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  updateStatus(id: string, status: string) {
    return apiRequest(`/medicines/${id}`, {
      method: 'PATCH',
      auth: true,
      body: {status},
    });
  },

  delete(id: string) {
    return apiRequest(`/medicines/${id}`, {method: 'DELETE', auth: true});
  },
};
