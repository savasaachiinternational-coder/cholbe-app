import {apiRequest} from './client';

export type Address = {
  id: string;
  label: string;
  region: string | null;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

export const addressesApi = {
  list() {
    return apiRequest<Address[]>('/addresses', {auth: true});
  },

  create(payload: {
    label: string;
    region?: string;
    formattedAddress: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }) {
    return apiRequest<Address>('/addresses', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  update(
    id: string,
    payload: {
      label?: string;
      region?: string;
      formattedAddress?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    },
  ) {
    return apiRequest<Address>(`/addresses/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },
};
