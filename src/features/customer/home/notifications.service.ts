import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';

export interface NotificationItem {
  id: string;
  type: 'booking' | 'quote' | 'payment' | 'system';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

/** Unread count for the header bell indicator. Authenticated (bearer token). */
async function fetchUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>('/notification/getUnreadCount');
  return data.count;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data } = await apiClient.get<NotificationItem[]>('/notification/getMyNotifications');
  return data;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUnreadCount: build.query<number, void>({
      queryFn: () => toQueryResult(() => fetchUnreadCount()),
      providesTags: ['Notifications'],
    }),
    getMyNotifications: build.query<NotificationItem[], void>({
      queryFn: () => toQueryResult(() => fetchNotifications()),
      providesTags: ['Notifications'],
    }),
  }),
});

export const { useGetUnreadCountQuery, useGetMyNotificationsQuery } = notificationsApi;
