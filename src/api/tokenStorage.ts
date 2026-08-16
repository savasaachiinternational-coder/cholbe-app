import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@cholbe/access_token';
const USER_KEY = '@cholbe/user';

export type StoredUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
};

export async function saveSession(accessToken: string, user: StoredUser) {
  await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getAccessToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function hasSession() {
  const token = await getAccessToken();
  return Boolean(token);
}
