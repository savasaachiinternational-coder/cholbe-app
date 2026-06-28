import {apiRequest} from './client';

export type Appointment = {
  id: string;
  scheduledDate: string;
  timeSlot: string;
  durationMin: number;
  fee: string | number;
  status: string;
  agoraChannel: string | null;
  doctor: {
    id: string;
    specialty: string;
    user: { fullName: string; avatarUrl: string | null };
  };
};

export type AgoraToken = {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expiresAt: string;
};

export const appointmentsApi = {
  list() {
    return apiRequest<Appointment[]>('/appointments', {auth: true});
  },

  getById(id: string) {
    return apiRequest<Appointment>(`/appointments/${id}`, {auth: true});
  },

  book(payload: {
    doctorId: string;
    scheduledDate: string;
    timeSlot: string;
    durationMin?: number;
    paymentMethod?: string;
  }) {
    return apiRequest<Appointment>('/appointments', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  updateStatus(id: string, status: string) {
    return apiRequest<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status },
    });
  },

  getAgoraToken(id: string) {
    return apiRequest<AgoraToken>(`/appointments/${id}/agora-token`, {
      method: 'POST',
      auth: true,
    });
  },
};
