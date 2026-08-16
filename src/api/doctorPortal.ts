import {apiRequest} from './client';

export type DoctorPatient = {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  patientProfile?: {
    age?: number | null;
    gender?: string | null;
    bloodGroup?: string | null;
  } | null;
};

export type DoctorAppointment = {
  id: string;
  patientId: string;
  scheduledDate: string;
  timeSlot: string;
  durationMin: number;
  fee: string | number;
  consultationType: 'VIDEO' | 'CHAT' | 'AUDIO';
  status: string;
  agoraChannel?: string | null;
  patient: DoctorPatient;
  _count?: {messages: number};
};

export type DoctorQualification = {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  createdAt: string;
};

export type DoctorExperience = {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  isPresent: boolean;
  duration: string;
  createdAt: string;
};

export type DoctorInstruction = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isPresent: boolean;
  duration: string;
  createdAt: string;
};

export type DoctorWeeklySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
};

export type DoctorPayoutMethod = {
  id: string;
  label: string;
  methodType: 'BANK' | 'BKASH' | 'NAGAD';
  accountMasked: string;
  isPrimary: boolean;
};

export type DoctorProfileDetail = {
  id: string;
  specialty: string;
  degree: string | null;
  fee: string | number;
  bio: string | null;
  imageUrl: string | null;
  isOnline: boolean;
  registrationNumber: string | null;
  chamberAddress: string | null;
  languages: string[];
  categories: string[];
  specialtyRef: {id: string; name: string; slug: string} | null;
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  qualifications: DoctorQualification[];
  experiences: DoctorExperience[];
  instructions: DoctorInstruction[];
  weeklyAvailability: DoctorWeeklySlot[];
  payoutMethods: DoctorPayoutMethod[];
  reviewAverage: number;
  reviewCount: number;
  earnings: {total: string | number; availableBalance?: string | number; pendingWithdrawal?: string | number; completedAppointments: number};
};

export type DoctorFinance = {
  wallet: {
    totalEarnings: number;
    availableBalance: number;
    pendingWithdrawal: number;
    completedConsultations: number;
    recentEarnings: {
      id: string;
      patientName: string;
      amount: string | number;
      date: string;
      consultationType: string;
      timeSlot: string;
    }[];
    recentWithdrawals: DoctorWithdrawal[];
  };
  payoutMethods: DoctorPayoutMethod[];
};

export type DoctorWithdrawal = {
  id: string;
  amount: string | number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED';
  note?: string | null;
  createdAt: string;
  payoutMethod?: DoctorPayoutMethod | null;
};

export type DoctorEditTab =
  | 'profile'
  | 'qualifications'
  | 'experience'
  | 'instructions'
  | 'availability'
  | 'payment';

export type DoctorProfileData = DoctorProfileDetail;

export type DoctorDashboard = {
  doctor: DoctorProfileDetail;
  stats: {
    todayAppointments: number;
    upcomingAppointments: number;
    totalPatients: number;
    totalAppointments: number;
    activeConsultations: number;
  };
  nextAppointment: DoctorAppointment | null;
  recentAppointments: DoctorAppointment[];
};

export type DoctorPatientRow = {
  patient: DoctorPatient;
  appointmentCount: number;
  lastAppointmentDate: string;
  lastStatus: string;
};

export const doctorPortalApi = {
  dashboard() {
    return apiRequest<DoctorDashboard>('/doctor/dashboard', {auth: true});
  },

  getProfile() {
    return apiRequest<DoctorProfileDetail>('/doctor/profile', {auth: true});
  },

  appointments(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<DoctorAppointment[]>(`/doctor/appointments${query}`, {auth: true});
  },

  patients() {
    return apiRequest<DoctorPatientRow[]>('/doctor/patients', {auth: true});
  },

  consultations() {
    return apiRequest<DoctorAppointment[]>('/doctor/consultations', {auth: true});
  },

  updateProfile(payload: Record<string, unknown>) {
    return apiRequest<DoctorProfileDetail>('/doctor/profile', {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  addQualification(payload: {
    degree: string;
    institution: string;
    fieldOfStudy?: string;
    yearFrom?: number;
    yearTo?: number;
  }) {
    return apiRequest<DoctorQualification>('/doctor/qualifications', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateQualification(id: string, payload: Partial<DoctorQualification>) {
    return apiRequest<DoctorQualification>(`/doctor/qualifications/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteQualification(id: string) {
    return apiRequest(`/doctor/qualifications/${id}`, {method: 'DELETE', auth: true});
  },

  addExperience(payload: {
    title: string;
    institution: string;
    startDate: string;
    endDate?: string;
    isPresent?: boolean;
  }) {
    return apiRequest<DoctorExperience>('/doctor/experiences', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateExperience(id: string, payload: Partial<DoctorExperience>) {
    return apiRequest<DoctorExperience>(`/doctor/experiences/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteExperience(id: string) {
    return apiRequest(`/doctor/experiences/${id}`, {method: 'DELETE', auth: true});
  },

  addInstruction(payload: {
    name: string;
    startDate: string;
    endDate?: string;
    isPresent?: boolean;
  }) {
    return apiRequest<DoctorInstruction>('/doctor/instructions', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateInstruction(id: string, payload: Partial<DoctorInstruction>) {
    return apiRequest<DoctorInstruction>(`/doctor/instructions/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteInstruction(id: string) {
    return apiRequest(`/doctor/instructions/${id}`, {method: 'DELETE', auth: true});
  },

  createWeeklySlot(payload: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes?: number;
    isActive?: boolean;
  }) {
    return apiRequest<DoctorWeeklySlot>('/doctor/availability/slots', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateWeeklySlot(
    slotId: string,
    payload: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      slotMinutes?: number;
      isActive?: boolean;
    },
  ) {
    return apiRequest<DoctorWeeklySlot>(`/doctor/availability/slots/${slotId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteWeeklySlot(slotId: string) {
    return apiRequest(`/doctor/availability/slots/${slotId}`, {method: 'DELETE', auth: true});
  },

  upsertPayoutMethod(payload: {
    id?: string;
    label: string;
    methodType: 'BANK' | 'BKASH' | 'NAGAD';
    accountMasked: string;
    isPrimary?: boolean;
  }) {
    return apiRequest<DoctorPayoutMethod>('/doctor/payout-methods', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  deletePayoutMethod(id: string) {
    return apiRequest(`/doctor/payout-methods/${id}`, {method: 'DELETE', auth: true});
  },

  getFinance() {
    return apiRequest<DoctorFinance>('/doctor/finance', {auth: true});
  },

  listWithdrawals() {
    return apiRequest<DoctorWithdrawal[]>('/doctor/withdrawals', {auth: true});
  },

  requestWithdrawal(payload: {amount: number; payoutMethodId?: string}) {
    return apiRequest<DoctorWithdrawal>('/doctor/withdrawals', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateAppointmentStatus(id: string, status: string) {
    return apiRequest<DoctorAppointment>(`/doctor/appointments/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: {status},
    });
  },
};
