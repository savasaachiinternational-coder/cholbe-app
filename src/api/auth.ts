import {apiRequest} from './client';
import {saveSession, getAccessToken, getStoredUser, type StoredUser} from './tokenStorage';

export type AuthResponse = {
  accessToken: string;
  user: StoredUser;
};

export type OtpChannel = 'SMS' | 'EMAIL';

function contactChannel(contact: string): OtpChannel {
  return contact.includes('@') ? 'EMAIL' : 'SMS';
}

export const authApi = {
  async login(identifier: string, password: string) {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: {identifier, password},
    });
    await saveSession(res.accessToken, res.user);
    return res;
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });
    await saveSession(res.accessToken, res.user);
    return res;
  },

  async sendOtp(contact: string, channel?: OtpChannel) {
    return apiRequest<{message: string; debugCode?: string}>('/auth/otp/send', {
      method: 'POST',
      body: {contact, channel: channel ?? contactChannel(contact)},
    });
  },

  async verifyOtp(contact: string, code: string) {
    return apiRequest<{verified: boolean}>('/auth/otp/verify', {
      method: 'POST',
      body: {contact, code},
    });
  },

  async forgotPassword(contact: string) {
    return authApi.sendOtp(contact, contactChannel(contact));
  },

  async resetPassword(contact: string, code: string, newPassword: string) {
    return apiRequest<{message: string}>('/auth/password/reset', {
      method: 'POST',
      body: {contact, code, newPassword},
    });
  },

  async patientOnboarding(payload: {
    age?: number;
    gender?: string;
    usagePurpose?: string;
  }) {
    return apiRequest('/auth/onboarding/patient', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  async getMe() {
    return apiRequest('/auth/me', {auth: true});
  },

  async medicalHistory(payload: {
    conditions?: string[];
    mealBreakfast?: string;
    mealLunch?: string;
    mealDinner?: string;
  }) {
    return apiRequest('/auth/onboarding/medical-history', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  async updateMe(payload: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const res = await apiRequest<StoredUser>('/users/me', {
      method: 'PATCH',
      auth: true,
      body: payload,
    });
    const token = await getAccessToken();
    const existing = await getStoredUser();
    if (token && existing) {
      await saveSession(token, {...existing, ...res, status: existing.status});
    }
    return res;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return apiRequest<{message: string}>('/users/me/password', {
      method: 'PATCH',
      auth: true,
      body: {currentPassword, newPassword},
    });
  },

  async deleteAccount() {
    return apiRequest<{deleted: boolean; message: string}>('/users/me', {
      method: 'DELETE',
      auth: true,
    });
  },

  async getAllUsers(params?: {role?: string; status?: string}) {
    const qs = new URLSearchParams();
    if (params?.role) qs.set('role', params.role);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiRequest<PublicUser[]>(`/auth/users${query ? `?${query}` : ''}`);
  },
};

export type PublicUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
};
