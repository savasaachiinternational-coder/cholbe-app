import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {setCrashReportingUser} from '../monitoring/sentry';

const TOKEN_SERVICE = 'com.cholbe.session.token';
const USER_SERVICE = 'com.cholbe.session.user';

// Pre-encryption keys, read once so existing installs stay logged in.
const LEGACY_TOKEN_KEY = '@cholbe/access_token';
const LEGACY_USER_KEY = '@cholbe/user';

const SECURE_OPTIONS = {
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
} satisfies Keychain.SetOptions;

export type StoredUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
};

let tokenCache: string | null | undefined;
let userCache: StoredUser | null | undefined;

async function writeSecure(service: string, value: string) {
  await Keychain.setGenericPassword('cholbe', value, {
    ...SECURE_OPTIONS,
    service,
  });
}

async function readSecure(service: string): Promise<string | null> {
  try {
    const creds = await Keychain.getGenericPassword({service});
    return creds ? creds.password : null;
  } catch {
    return null;
  }
}

async function clearSecure(service: string) {
  try {
    await Keychain.resetGenericPassword({service});
  } catch {
    // Nothing stored for this service.
  }
}

/**
 * Move a session written by an older build out of plaintext AsyncStorage and
 * into the Keychain / Android Keystore.
 */
async function migrateLegacySession() {
  const [legacyToken, legacyUser] = await Promise.all([
    AsyncStorage.getItem(LEGACY_TOKEN_KEY),
    AsyncStorage.getItem(LEGACY_USER_KEY),
  ]);

  if (legacyToken) {
    await writeSecure(TOKEN_SERVICE, legacyToken);
  }
  if (legacyUser) {
    await writeSecure(USER_SERVICE, legacyUser);
  }
  if (legacyToken || legacyUser) {
    await AsyncStorage.removeMany([LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
  }

  return {legacyToken, legacyUser};
}

export async function saveSession(accessToken: string, user: StoredUser) {
  const serializedUser = JSON.stringify(user);
  await writeSecure(TOKEN_SERVICE, accessToken);
  await writeSecure(USER_SERVICE, serializedUser);
  tokenCache = accessToken;
  userCache = user;
  setCrashReportingUser({id: user.id, role: user.role});
}

export async function getAccessToken() {
  if (tokenCache !== undefined) {
    return tokenCache;
  }

  let token = await readSecure(TOKEN_SERVICE);
  if (!token) {
    token = (await migrateLegacySession()).legacyToken;
  }

  tokenCache = token;
  return token;
}

export async function getStoredUser(): Promise<StoredUser | null> {
  if (userCache !== undefined) {
    return userCache;
  }

  let raw = await readSecure(USER_SERVICE);
  if (!raw) {
    raw = (await migrateLegacySession()).legacyUser;
  }

  let user: StoredUser | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw) as StoredUser;
    } catch {
      user = null;
    }
  }

  userCache = user;
  return user;
}

export async function clearSession() {
  await Promise.all([
    clearSecure(TOKEN_SERVICE),
    clearSecure(USER_SERVICE),
    AsyncStorage.removeMany([LEGACY_TOKEN_KEY, LEGACY_USER_KEY]),
  ]);
  tokenCache = null;
  userCache = null;
  setCrashReportingUser(null);
}

export async function hasSession() {
  const token = await getAccessToken();
  return Boolean(token);
}
