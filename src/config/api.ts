import {Platform} from 'react-native';

/** Android emulator uses 10.0.2.2 to reach host localhost */
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
