import {Platform} from 'react-native';

const PRODUCTION_API_BASE = 'https://cholbeapi.pino7.com/api/v1';

const LOCAL_DEV_API_BASE =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v1'
    : 'http://localhost:3000/api/v1';

/**
 * Production VPS API. Set to true only when testing against a local server on emulator.
 */
const USE_LOCAL_DEV_SERVER = false;

export const API_BASE_URL =
  USE_LOCAL_DEV_SERVER && __DEV__ ? LOCAL_DEV_API_BASE : PRODUCTION_API_BASE;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');
