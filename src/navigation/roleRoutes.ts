import type {RootStackParamList} from './types';

export type AppRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'DOCTOR';

/**
 * Maps the authenticated user's role to the correct home stack route.
 */
export function getHomeRouteForRole(
  role: string | undefined | null,
): keyof RootStackParamList {
  switch (role?.toUpperCase()) {
    case 'VENDOR':
      return 'VHome';
    case 'ADMIN':
      return 'AHome';
    case 'DOCTOR':
      return 'DHome';
    case 'CUSTOMER':
    default:
      return 'Home';
  }
}
