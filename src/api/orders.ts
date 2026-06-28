import {apiRequest} from './client';

export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD' | 'CARD';

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: string | number;
  variant: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  subtotal: string | number;
  deliveryCharge: string | number;
  total: string | number;
  createdAt: string;
  items: OrderItem[];
  statusEvents?: { status: string; note: string | null; createdAt: string }[];
  addressSnapshot?: { formattedAddress?: string; region?: string };
};

export const ordersApi = {
  checkout(payload: {
    addressId: string;
    paymentMethod: PaymentMethod;
    prescriptionUrl?: string;
    notes?: string;
  }) {
    return apiRequest<Order>('/orders/checkout', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  list() {
    return apiRequest<Order[]>('/orders', {auth: true});
  },

  getById(id: string) {
    return apiRequest<Order>(`/orders/${id}`, {auth: true});
  },

  confirmPayment(orderId: string) {
    return apiRequest<Order>(`/orders/${orderId}/payment/confirm`, {
      method: 'POST',
      auth: true,
    });
  },
};

export function uiPaymentToApi(
  method: 'COD' | 'bKash' | 'Nagad' | 'Card',
): PaymentMethod {
  if (method === 'bKash') return 'BKASH';
  if (method === 'Nagad') return 'NAGAD';
  return method;
}
