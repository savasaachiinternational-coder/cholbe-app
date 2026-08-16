import {apiRequest} from './client';
import type {MedicationDraft} from '../utils/medicationDraft';

export type PrescriptionMedicine = {
  id: string;
  name: string;
  dose: string | null;
  instruction: string | null;
  mealTiming: string | null;
  frequency: string | null;
  times: string[];
  startDate: string | null;
  endDate: string | null;
  reminderBeforeMinutes: number | null;
  followUpMinutes: number | null;
  inventoryCount: number | null;
};

export type Prescription = {
  id: string;
  fileUrl: string;
  fileName: string | null;
  source: string | null;
  createdAt: string;
  medicines: PrescriptionMedicine[];
};

export type ScanPrescriptionResult = {
  prescription: Prescription;
  draft: MedicationDraft;
};

export const prescriptionsApi = {
  list() {
    return apiRequest<Prescription[]>('/prescriptions', {auth: true});
  },

  get(id: string) {
    return apiRequest<Prescription>(`/prescriptions/${id}`, {auth: true});
  },

  getDraft(id: string) {
    return apiRequest<MedicationDraft>(`/prescriptions/${id}/draft`, {auth: true});
  },

  scan(payload: {fileUrl: string; fileName?: string; source?: string}) {
    return apiRequest<ScanPrescriptionResult>('/prescriptions/scan', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  create(payload: {
    fileUrl: string;
    fileName?: string;
    source?: string;
    medicines?: Array<{
      name: string;
      dose?: string;
      instruction?: string;
      mealTiming?: string;
      frequency?: string;
      times?: string[];
      startDate?: string;
      endDate?: string;
      reminderBeforeMinutes?: number;
      followUpMinutes?: number;
      inventoryCount?: number;
    }>;
  }) {
    return apiRequest<Prescription>('/prescriptions', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },
};
