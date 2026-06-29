import {apiRequest} from './client';

export type VendorDocument = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  status: 'PENDING' | 'VERIFIED';
  createdAt: string;
};

export type VendorPayoutMethod = {
  id: string;
  label: string;
  methodType: 'BANK' | 'BKASH' | 'NAGAD';
  accountMasked: string;
  isPrimary: boolean;
};

export type VendorDashboard = {
  vendor: {
    id: string;
    pharmacyName: string;
    phone?: string | null;
    address?: string | null;
    isStoreOpen: boolean;
    bannerUrl?: string | null;
    approvalStatus: string;
    user?: {fullName: string; phone?: string | null};
  };
  stats: {
    productCount: number;
    orderCount: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  wallet: {
    availableBalance: number;
    nextPayoutLabel: string;
  };
  metrics: {
    rating: number;
    acceptanceRate: number;
  };
  documents: VendorDocument[];
  payoutMethods: VendorPayoutMethod[];
};

export const vendorApi = {
  dashboard() {
    return apiRequest<VendorDashboard>('/vendor/dashboard', {auth: true});
  },

  updateProfile(payload: Record<string, unknown>) {
    return apiRequest('/vendor/profile', {method: 'PATCH', auth: true, body: payload});
  },

  addDocument(payload: {fileName: string; fileUrl: string; mimeType?: string}) {
    return apiRequest<VendorDocument>('/vendor/documents', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  removeDocument(id: string) {
    return apiRequest(`/vendor/documents/${id}`, {method: 'DELETE', auth: true});
  },

  upsertPayoutMethod(payload: {
    id?: string;
    label: string;
    methodType: 'BANK' | 'BKASH' | 'NAGAD';
    accountMasked: string;
    isPrimary?: boolean;
  }) {
    return apiRequest<VendorPayoutMethod>('/vendor/payout-methods', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  payments() {
    return apiRequest('/vendor/payments', {auth: true});
  },

  orders(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/orders/vendor/list${qs}`, {auth: true});
  },

  orderDetail(orderId: string) {
    return apiRequest(`/orders/vendor/${orderId}`, {auth: true});
  },

  updateOrderStatus(orderId: string, status: string, note?: string) {
    return apiRequest(`/orders/vendor/${orderId}/status`, {
      method: 'PATCH',
      auth: true,
      body: {status, note},
    });
  },

  revenueMonthly(): Promise<{month: string; revenue: number}[]> {
    return apiRequest('/vendor/chart/revenue-monthly', {auth: true});
  },

  ordersMonthly(): Promise<{month: string; count: number}[]> {
    return apiRequest('/vendor/chart/orders-monthly', {auth: true});
  },
};
