import {apiRequest} from './client';

export const vendorProductsApi = {
  create(payload: {
    name: string;
    genericName?: string;
    category?: string;
    brand?: string;
    unitPrice: number;
    discountPrice?: number;
    stockQuantity: number;
    minAlertLevel?: number;
    expiryDate?: string;
    batchNumber?: string;
    unitType?: string;
    temperature?: string;
    imageUrl?: string;
    prescriptionRequired?: boolean;
    reminderActive?: boolean;
    medicineId?: string;
  }) {
    return apiRequest('/vendor/products', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  list() {
    return apiRequest('/vendor/products', {auth: true});
  },

  updateStatus(id: string, isActive: boolean) {
    return apiRequest(`/vendor/products/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: { isActive },
    });
  },

  delete(id: string) {
    return apiRequest(`/vendor/products/${id}`, { method: 'DELETE', auth: true });
  },

  update(id: string, payload: Partial<{
    name: string;
    genericName?: string;
    category?: string;
    brand?: string;
    unitPrice: number;
    discountPrice?: number;
    stockQuantity: number;
    minAlertLevel?: number;
    expiryDate?: string;
    batchNumber?: string;
    unitType?: string;
    temperature?: string;
    imageUrl?: string;
    prescriptionRequired?: boolean;
    reminderActive?: boolean;
  }>) {
    return apiRequest(`/vendor/products/${id}`, { method: 'PATCH', auth: true, body: payload });
  },
};
