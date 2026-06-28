import {apiRequest} from './client';

export type ReportType = 'LAB' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';

export type HealthReport = {
  id: string;
  title: string;
  reportType: ReportType;
  provider: string | null;
  reportDate: string;
  fileUrl: string;
  tip: string | null;
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
    return apiRequest('/reports', {method: 'POST', auth: true, body: payload});
  },

  list() {
    return apiRequest<HealthReport[]>('/reports', {auth: true});
  },
};
