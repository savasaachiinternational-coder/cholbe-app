import {apiRequest} from './client';

export type ConsultationMessage = {
  id: string;
  appointmentId: string;
  content: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
};

export type ConsultationContext = {
  appointment: {
    id: string;
    timeSlot: string;
    scheduledDate: string;
    status: string;
    patient?: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
    doctor: {
      id: string;
      specialty: string;
      isOnline: boolean;
      user: { fullName: string; avatarUrl: string | null };
    };
  };
  sharedReport: {
    title: string;
    provider: string | null;
    reportDate: string;
    fileUrl: string;
  } | null;
};

export const consultationsApi = {
  activeAppointment(doctorId: string) {
    return apiRequest<ConsultationContext['appointment'] | null>(
      `/consultations/doctors/${doctorId}/active-appointment`,
      {auth: true},
    );
  },

  context(appointmentId: string) {
    return apiRequest<ConsultationContext>(
      `/consultations/appointments/${appointmentId}/context`,
      {auth: true},
    );
  },

  listMessages(appointmentId: string) {
    return apiRequest<ConsultationMessage[]>(
      `/consultations/appointments/${appointmentId}/messages`,
      {auth: true},
    );
  },

  sendMessage(
    appointmentId: string,
    payload: { content: string; attachmentUrl?: string; attachmentType?: string },
  ) {
    return apiRequest<ConsultationMessage>(
      `/consultations/appointments/${appointmentId}/messages`,
      {method: 'POST', auth: true, body: payload},
    );
  },

  submitFeedback(appointmentId: string, payload: { rating: number; comment?: string }) {
    return apiRequest(`/consultations/appointments/${appointmentId}/feedback`, {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  getFeedback(appointmentId: string) {
    return apiRequest<{id: string; rating: number; comment: string | null} | null>(
      `/consultations/appointments/${appointmentId}/feedback`,
      {auth: true},
    );
  },
};
