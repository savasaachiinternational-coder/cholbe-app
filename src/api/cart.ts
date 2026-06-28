import {apiRequest} from './client';

export type CartItem = {
  id: string;
  vendorProductId: string | null;
  name: string;
  variant: 'PC' | 'STRIPE' | 'BOX';
  quantity: number;
  unitPrice: string | number;
  vendorProduct?: {
    id: string;
    imageUrl: string | null;
    unitType: string | null;
  } | null;
};

export type CartResponse = {
  id: string;
  items: CartItem[];
  subtotal: number;
};

export const cartApi = {
  get() {
    return apiRequest<CartResponse>('/cart', {auth: true});
  },

  addItem(vendorProductId: string, quantity = 1, variant?: 'PC' | 'STRIPE' | 'BOX') {
    return apiRequest<CartResponse>('/cart/items', {
      method: 'POST',
      auth: true,
      body: {vendorProductId, quantity, variant},
    });
  },

  updateItem(itemId: string, quantity: number) {
    return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      auth: true,
      body: {quantity},
    });
  },

  removeItem(itemId: string) {
    return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  clear() {
    return apiRequest<CartResponse>('/cart', {method: 'DELETE', auth: true});
  },
};
