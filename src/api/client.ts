import {API_BASE_URL} from '../config/api';
import {getAccessToken} from './tokenStorage';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  {method = 'GET', body, auth = false, headers = {}}: RequestOptions = {},
): Promise<T> {
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: reqHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        text.slice(0, 120) || `Invalid response (${response.status})`,
        response.status,
        text,
      );
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? Array.isArray((data as {message: unknown}).message)
          ? (data as {message: string[]}).message.join(', ')
          : String((data as {message: string}).message)
        : null) || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
