import {useEffect, useState} from 'react';
import {getStoredUser} from '../api/tokenStorage';
import {normalizeRole} from '../navigation/roleMenus';
import type {AppRole} from '../navigation/roleRoutes';

export function useRole(): AppRole | null {
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;
    getStoredUser()
      .then(user => {
        if (active) setRole(normalizeRole(user?.role));
      })
      .catch(() => {
        if (active) setRole('CUSTOMER');
      });
    return () => {
      active = false;
    };
  }, []);

  return role;
}
