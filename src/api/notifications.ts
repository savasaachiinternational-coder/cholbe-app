import {apiRequest} from './client';

export type Notification = {
  id: string;
  category: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export const notificationsApi = {
  list() {
    return apiRequest<Notification[]>('/notifications', {auth: true});
  },

  unreadCount() {
    return apiRequest<{ count: number }>('/notifications/unread-count', {auth: true});
  },

  markRead(id: string) {
    return apiRequest(`/notifications/${id}/read`, {method: 'PATCH', auth: true});
  },

  markAllRead() {
    return apiRequest('/notifications/read-all', {method: 'PATCH', auth: true});
  },
};
