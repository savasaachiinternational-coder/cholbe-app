import {apiRequest} from './client';

export const adminApi = {
  dashboard() {
    return apiRequest<{
      totalOrders: number;
      totalUsers: number;
      totalVendors: number;
      totalRevenue: string | number;
      growthPercent: number;
    }>('/admin/dashboard', {auth: true});
  },

  orders(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/orders${qs}`, {auth: true});
  },

  vendors(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/vendors${qs}`, {auth: true});
  },

  updateVendorStatus(vendorId: string, approvalStatus: string) {
    return apiRequest(`/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      auth: true,
      body: { approvalStatus },
    });
  },

  users(role?: string, status?: string) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const qs = params.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`, {auth: true});
  },

  salesReport(from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return apiRequest(`/admin/reports/sales${qs ? `?${qs}` : ''}`, {auth: true});
  },

  inventoryOverview() {
    return apiRequest('/admin/inventory/overview', {auth: true});
  },

  payments() {
    return apiRequest('/admin/payments', {auth: true});
  },
};
