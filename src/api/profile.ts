import {apiRequest} from './client';

export type HealthVitals = {
  bloodPressure: { value: string; checkedAgo: string } | null;
  oxygen: { value: string; checkedAgo: string } | null;
};

export type ProfileOverview = {
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    patientProfile: {
      age: number | null;
      gender: string | null;
      bloodGroup: string | null;
      conditions: string[];
      familyMembers: FamilyMember[];
      emergencyContacts: EmergencyContact[];
    } | null;
  };
  medicationCount: number;
  nextAppointment: AppointmentSummary | null;
  assignedDoctor: {
    id: string;
    specialty: string;
    fee?: string | number;
    user: { fullName: string; avatarUrl: string | null };
  } | null;
  latestReport: { title: string; reportDate: string; provider: string | null } | null;
  defaultAddress: { formattedAddress: string; region: string | null } | null;
  healthVitals: HealthVitals;
  isFamilyDependent?: boolean;
  guardian?: { id: string; fullName: string; email: string | null; phone: string | null } | null;
};

export type FamilyMember = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  relationship: string;
  phone: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  memberUser?: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    patientProfile?: {
      age: number | null;
      gender: string | null;
      bloodGroup: string | null;
    } | null;
  } | null;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

export type FamilyMemberDetails = {
  familyMember: {
    id: string;
    name: string;
    relationship: string;
    age: number | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
    patientProfile: {
      age: number | null;
      gender: string | null;
      bloodGroup: string | null;
      conditions: string[];
    } | null;
  };
  medicationCount: number;
  medications: {
    id: string;
    medicineName: string;
    dose: string | null;
    instruction: string | null;
    isActive: boolean;
    times: string[];
  }[];
  reports: {
    id: string;
    title: string;
    reportType: string;
    reportDate: string;
    provider: string | null;
  }[];
  appointments: AppointmentSummary[];
  nextAppointment: AppointmentSummary | null;
  healthVitals: HealthVitals;
  defaultAddress: { formattedAddress: string; region: string | null } | null;
};

export type AppointmentSummary = {
  id: string;
  timeSlot: string;
  scheduledDate: string;
  status: string;
  agoraChannel: string | null;
  doctor: {
    id: string;
    specialty: string;
    user: { fullName: string; avatarUrl: string | null };
  };
};

export const profileApi = {
  overview() {
    return apiRequest<ProfileOverview>('/profile/overview', {auth: true});
  },

  updatePatient(payload: {
    age?: number;
    gender?: string;
    bloodGroup?: string;
    usagePurpose?: string;
  }) {
    return apiRequest('/profile/patient', {method: 'PATCH', auth: true, body: payload});
  },

  addFamilyMember(payload: {
    name: string;
    age?: number;
    gender?: string;
    relationship: string;
    phone?: string;
    email?: string;
    password: string;
    avatarUrl?: string;
  }) {
    return apiRequest('/profile/family-members', {method: 'POST', auth: true, body: payload});
  },

  updateFamilyMember(
    id: string,
    payload: {
      name: string;
      age?: number;
      gender?: string;
      relationship: string;
      phone?: string;
      avatarUrl?: string;
    },
  ) {
    return apiRequest(`/profile/family-members/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },

  removeFamilyMember(id: string) {
    return apiRequest(`/profile/family-members/${id}`, {method: 'DELETE', auth: true});
  },

  familyMemberDetails(id: string) {
    return apiRequest<FamilyMemberDetails>(`/profile/family-members/${id}/details`, {
      auth: true,
    });
  },

  removeEmergencyContact(id: string) {
    return apiRequest(`/profile/emergency-contacts/${id}`, {method: 'DELETE', auth: true});
  },

  addEmergencyContact(payload: { name: string; relation: string; phone: string }) {
    return apiRequest('/profile/emergency-contacts', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateVitals(payload: { bloodPressure?: string; oxygen?: string }) {
    return apiRequest<HealthVitals>('/profile/vitals', {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
  },
};
