import {apiRequest} from './client';

export type AdminAppointment = {
  id: string;
  scheduledDate: string;
  timeSlot: string;
  durationMin: number;
  fee: string | number;
  consultationType: string;
  status: string;
  patient: {fullName: string; phone: string | null; avatarUrl: string | null};
  doctor: {
    id: string;
    specialty: string;
    user: {fullName: string; avatarUrl: string | null};
  };
  feedback: {rating: number; comment: string | null} | null;
};

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  appointment: {
    patient: {fullName: string; avatarUrl: string | null};
    doctor: {user: {fullName: string}};
  };
};

export type Qualification = {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  createdAt: string;
};

export type Experience = {
  id: string;
  title: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  isPresent: boolean;
  duration: string;
  createdAt: string;
};

export type Instruction = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  isPresent: boolean;
  duration: string;
  createdAt: string;
};

export type AdminDoctorDetail = {
  id: string;
  specialty: string;
  degree: string | null;
  fee: string | number;
  bio: string | null;
  imageUrl: string | null;
  status: string;
  isOnline: boolean;
  registrationNumber: string | null;
  chamberAddress: string | null;
  languages: string[];
  categories: string[];
  specialtyRef: {id: string; name: string; slug: string} | null;
  user: {id: string; fullName: string; email: string | null; phone: string | null; status: string};
  qualifications: Qualification[];
  experiences: Experience[];
  instructions: Instruction[];
  weeklyAvailability: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
    isActive: boolean;
  }>;
  reviewAverage: number;
  reviewCount: number;
};

export const adminApi = {
  dashboard() {
    return apiRequest<{
      totalOrders: number;
      totalUsers: number;
      totalVendors: number;
      totalRevenue: string | number;
      growthPercent: number;
    }>('/admin/dashboard', {auth: true});
  },

  orders(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/orders${qs}`, {auth: true});
  },

  vendors(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/vendors${qs}`, {auth: true});
  },

  updateVendorStatus(vendorId: string, approvalStatus: string) {
    return apiRequest(`/admin/vendors/${vendorId}/status`, {
      method: 'PATCH',
      auth: true,
      body: {approvalStatus},
    });
  },

  users(role?: string, status?: string) {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const qs = params.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`, {auth: true});
  },

  salesReport(from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return apiRequest(`/admin/reports/sales${qs ? `?${qs}` : ''}`, {auth: true});
  },

  inventoryOverview() {
    return apiRequest('/admin/inventory/overview', {auth: true});
  },

  payments() {
    return apiRequest('/admin/payments', {auth: true});
  },

  specialties() {
    return apiRequest<
      Array<{id: string; name: string; slug: string; icon: string | null; isActive: boolean}>
    >('/admin/specialties', {auth: true});
  },

  createSpecialty(payload: {name: string; icon?: string; isActive?: boolean}) {
    return apiRequest('/admin/specialties', {method: 'POST', auth: true, body: payload});
  },

  updateSpecialty(id: string, payload: {name?: string; icon?: string; isActive?: boolean}) {
    return apiRequest(`/admin/specialties/${id}`, {method: 'PATCH', auth: true, body: payload});
  },

  deleteSpecialty(id: string) {
    return apiRequest(`/admin/specialties/${id}`, {method: 'DELETE', auth: true});
  },

  // ─── Doctors ────────────────────────────────────────────────────────────────

  doctors(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/doctors${qs}`, {auth: true});
  },

  getDoctor(id: string) {
    return apiRequest<AdminDoctorDetail>(`/admin/doctors/${id}`, {auth: true});
  },

  createDoctor(payload: Record<string, unknown>) {
    return apiRequest('/admin/doctors', {method: 'POST', auth: true, body: payload});
  },

  updateDoctor(id: string, payload: Record<string, unknown>) {
    return apiRequest(`/admin/doctors/${id}`, {method: 'PATCH', auth: true, body: payload});
  },

  deleteDoctor(id: string) {
    return apiRequest(`/admin/doctors/${id}`, {method: 'DELETE', auth: true});
  },

  // ─── Qualifications ─────────────────────────────────────────────────────────

  addQualification(
    doctorId: string,
    payload: {degree: string; institution: string; fieldOfStudy?: string; yearFrom?: number; yearTo?: number},
  ) {
    return apiRequest<Qualification>(`/admin/doctors/${doctorId}/qualifications`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateQualification(doctorId: string, qualId: string, payload: Partial<Qualification>) {
    return apiRequest<Qualification>(`/admin/doctors/${doctorId}/qualifications/${qualId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteQualification(doctorId: string, qualId: string) {
    return apiRequest(`/admin/doctors/${doctorId}/qualifications/${qualId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  // ─── Experiences ────────────────────────────────────────────────────────────

  addExperience(
    doctorId: string,
    payload: {title: string; institution: string; startDate: string; endDate?: string; isPresent?: boolean},
  ) {
    return apiRequest<Experience>(`/admin/doctors/${doctorId}/experiences`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateExperience(doctorId: string, expId: string, payload: Partial<Experience>) {
    return apiRequest<Experience>(`/admin/doctors/${doctorId}/experiences/${expId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteExperience(doctorId: string, expId: string) {
    return apiRequest(`/admin/doctors/${doctorId}/experiences/${expId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  // ─── Instructions ────────────────────────────────────────────────────────────

  addInstruction(
    doctorId: string,
    payload: {name: string; startDate: string; endDate?: string; isPresent?: boolean},
  ) {
    return apiRequest<Instruction>(`/admin/doctors/${doctorId}/instructions`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateInstruction(doctorId: string, instrId: string, payload: Partial<Instruction>) {
    return apiRequest<Instruction>(`/admin/doctors/${doctorId}/instructions/${instrId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteInstruction(doctorId: string, instrId: string) {
    return apiRequest(`/admin/doctors/${doctorId}/instructions/${instrId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  // ─── Availability ────────────────────────────────────────────────────────────

  setDoctorWeeklyAvailability(
    id: string,
    slots: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotMinutes?: number;
      isActive?: boolean;
    }>,
  ) {
    return apiRequest(`/admin/doctors/${id}/availability/weekly`, {
      method: 'POST',
      auth: true,
      body: {slots},
    });
  },

  createWeeklySlot(
    doctorId: string,
    payload: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotMinutes?: number;
      isActive?: boolean;
    },
  ) {
    return apiRequest(`/admin/doctors/${doctorId}/availability/slots`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateWeeklySlot(
    doctorId: string,
    slotId: string,
    payload: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      slotMinutes?: number;
      isActive?: boolean;
    },
  ) {
    return apiRequest(`/admin/doctors/${doctorId}/availability/slots/${slotId}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  deleteWeeklySlot(doctorId: string, slotId: string) {
    return apiRequest(`/admin/doctors/${doctorId}/availability/slots/${slotId}`, {
      method: 'DELETE',
      auth: true,
    });
  },

  setDoctorDateOverride(id: string, date: string, isAvailable: boolean) {
    return apiRequest(`/admin/doctors/${id}/availability/override`, {
      method: 'POST',
      auth: true,
      body: {date, isAvailable},
    });
  },

  // ─── Appointments ────────────────────────────────────────────────────────────

  appointments(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return apiRequest<AdminAppointment[]>(`/admin/appointments${qs}`, {auth: true});
  },

  updateAppointmentStatus(id: string, status: string) {
    return apiRequest(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: {status},
    });
  },

  // ─── Reviews ─────────────────────────────────────────────────────────────────

  reviews(doctorId?: string) {
    const qs = doctorId ? `?doctorId=${doctorId}` : '';
    return apiRequest<AdminReview[]>(`/admin/reviews${qs}`, {auth: true});
  },

  deleteReview(id: string) {
    return apiRequest(`/admin/reviews/${id}`, {method: 'DELETE', auth: true});
  },
};
