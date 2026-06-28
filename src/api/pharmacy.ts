import {apiRequest} from './client';

export type PharmacyProduct = {
  id: string;
  name: string;
  genericName: string | null;
  category: string | null;
  brand: string | null;
  unitPrice: string | number;
  discountPrice: string | number | null;
  stockQuantity: number;
  unitType: string | null;
  imageUrl: string | null;
  prescriptionRequired: boolean;
  vendor?: { pharmacyName: string; address: string | null };
  medicine?: { id: string; name: string } | null;
};

export const pharmacyApi = {
  list(params?: { search?: string; category?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return apiRequest<PharmacyProduct[]>(
      `/pharmacy/products${query ? `?${query}` : ''}`,
    );
  },

  getById(id: string) {
    return apiRequest<PharmacyProduct>(`/pharmacy/products/${id}`);
  },
};
