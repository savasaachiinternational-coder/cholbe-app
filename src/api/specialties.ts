import {apiRequest} from './client';

export type Specialty = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
};

export const specialtiesApi = {
  list() {
    return apiRequest<Specialty[]>('/specialties');
  },
};
