import {apiRequest} from './client';

export type ReportType = 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';

export type HealthReport = {
  id: string;
  title: string;
  reportType: ReportType;
  provider: string | null;
  reportDate: string;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  tip: string | null;
  createdAt?: string;
};

export const reportsApi = {
  create(payload: {
    title: string;
    reportType?: ReportType;
    provider?: string;
    reportDate: string;
    fileUrl: string;
    fileName?: string;
    mimeType?: string;
    tip?: string;
  }) {
    return apiRequest<HealthReport>('/reports', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  list() {
    return apiRequest<HealthReport[]>('/reports', {auth: true});
  },

  get(id: string) {
    return apiRequest<HealthReport>(`/reports/${id}`, {auth: true});
  },

  update(
    id: string,
    payload: {
      title?: string;
      reportType?: ReportType;
      provider?: string;
      reportDate?: string;
      tip?: string;
    },
  ) {
    return apiRequest<HealthReport>(`/reports/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },
};
