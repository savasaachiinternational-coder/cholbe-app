import {apiRequest} from './client';

export const vendorApi = {
  dashboard() {
    return apiRequest('/vendor/dashboard', {auth: true});
  },

  updateProfile(payload: Record<string, unknown>) {
    return apiRequest('/vendor/profile', {method: 'PATCH', auth: true, body: payload});
  },

  payments() {
    return apiRequest('/vendor/payments', {auth: true});
  },

  orders(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/orders/vendor/list${qs}`, {auth: true});
  },

  updateOrderStatus(orderId: string, status: string, note?: string) {
    return apiRequest(`/orders/vendor/${orderId}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status, note },
    });
  },
};
