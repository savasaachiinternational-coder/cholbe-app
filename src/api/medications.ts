import {apiRequest} from './client';

export type MedicationSchedule = {
  id: string;
  medicineName: string;
  dose: string | null;
  instruction: string | null;
  mealTiming: string | null;
  times: string[];
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  reminderEnabled: boolean;
  reminderBeforeMinutes: number | null;
  followUpEnabled: boolean;
  followUpMinutes: number | null;
  followUpTime: string | null;
  refillEnabled: boolean;
  inventoryCount: number | null;
  refillDate: string | null;
  refillTime: string | null;
  caregiverName: string | null;
  prescriptionId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateMedicationSchedulePayload = {
  medicineName: string;
  dose?: string;
  instruction?: string;
  mealTiming?: string;
  times?: string[];
  frequency?: string;
  startDate?: string;
  endDate?: string;
  reminderEnabled?: boolean;
  reminderBeforeMinutes?: number;
  followUpEnabled?: boolean;
  followUpMinutes?: number;
  followUpTime?: string;
  refillEnabled?: boolean;
  inventoryCount?: number;
  refillDate?: string;
  refillTime?: string;
  caregiverName?: string;
  prescriptionId?: string;
};

export const medicationSchedulesApi = {
  create(payload: CreateMedicationSchedulePayload) {
    return apiRequest('/medication-schedules', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  list() {
    return apiRequest<MedicationSchedule[]>('/medication-schedules', {auth: true});
  },

  logDose(
    scheduleId: string,
    status: 'taken' | 'missed' | 'snoozed',
    options?: {snoozeMinutes?: number; scheduledTime?: string},
  ) {
    return apiRequest(`/medication-schedules/${scheduleId}/log`, {
      method: 'POST',
      auth: true,
      body: {
        status,
        snoozeMinutes: options?.snoozeMinutes,
        scheduledTime: options?.scheduledTime,
      },
    });
  },

  /**
   * Accepts any subset of the create fields plus the active toggle, so the
   * edit form can PATCH a whole schedule rather than only flipping isActive.
   */
  update(
    scheduleId: string,
    payload: Partial<CreateMedicationSchedulePayload> & {isActive?: boolean},
  ) {
    return apiRequest<MedicationSchedule>(`/medication-schedules/${scheduleId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },
};
