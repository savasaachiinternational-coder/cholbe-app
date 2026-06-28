import {apiRequest} from './client';

export type MedicationSchedule = {
  id: string;
  medicineName: string;
  dose: string | null;
  instruction: string | null;
  mealTiming: string | null;
  times: string[];
  isActive: boolean;
  createdAt: string;
};

export const medicationSchedulesApi = {
  create(payload: {
    medicineName: string;
    dose?: string;
    instruction?: string;
    mealTiming?: string;
    times?: string[];
  }) {
    return apiRequest('/medication-schedules', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  list() {
    return apiRequest<MedicationSchedule[]>('/medication-schedules', {auth: true});
  },

  logDose(scheduleId: string, status: 'taken' | 'missed' | 'snoozed', snoozeMinutes?: number) {
    return apiRequest(`/medication-schedules/${scheduleId}/log`, {
      method: 'POST',
      auth: true,
      body: { status, snoozeMinutes },
    });
  },

  update(scheduleId: string, payload: { isActive?: boolean }) {
    return apiRequest<MedicationSchedule>(`/medication-schedules/${scheduleId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },
};
