import {apiRequest} from './client';

export type PatientHomeDashboard = {
  user: {
    fullName: string;
    avatarUrl: string | null;
    location: string;
    lastActiveLabel: string;
  };
  nextMedication: {
    scheduleId: string;
    medicineName: string;
    dose: string | null;
    scheduledTime: string;
    canMarkTaken: boolean;
    minutesUntil: number;
    minutesUntilLabel: string;
  } | null;
  allDosesTakenToday: boolean;
  medicationStats: { taken: number; missed: number; remaining: number; total: number };
  healthVitals: {
    bloodPressure: { value: string; checkedAgo: string } | null;
    oxygen: { value: string } | null;
  };
  refill: { daysUntil: number; familyMonitoring: boolean };
  schedules: Array<{
    id: string;
    medicineName: string;
    dose: string | null;
    times: string[];
    mealTiming: string | null;
    instruction: string | null;
    todayLogs: Array<{
      status: string;
      scheduledTime: string | null;
      loggedAt: string;
    }>;
  }>;
  relatedProducts: Array<{
    id: string;
    name: string;
    genericName: string | null;
    unitPrice: string | number;
    discountPrice: string | number | null;
    imageUrl: string | null;
    category: string | null;
  }>;
  nextAppointment: {
    id: string;
    doctorName: string;
    specialty: string;
    scheduledDate: string;
    timeSlot: string;
  } | null;
  unreadNotifications: number;
};

export const homeApi = {
  dashboard() {
    return apiRequest<PatientHomeDashboard>('/patient/home', {auth: true});
  },
};
