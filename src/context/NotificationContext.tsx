import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {notificationsApi} from '../api/notifications';
import {hasSession} from '../api/tokenStorage';

type NotificationContextValue = {
  unreadCount: number;
  refresh: () => void;
};

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  refresh: () => {},
});

export function NotificationProvider({children}: {children: React.ReactNode}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const session = await hasSession();
      if (!session) return;
      const {count} = await notificationsApi.unreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 30000);

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sub.remove();
    };
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{unreadCount, refresh}}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationBadge() {
  return useContext(NotificationContext);
}
