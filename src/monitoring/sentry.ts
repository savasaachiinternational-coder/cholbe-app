import * as Sentry from '@sentry/react-native';
import {SENTRY_DSN, SENTRY_TRACES_SAMPLE_RATE} from '../config/sentry';

export const isCrashReportingEnabled = Boolean(SENTRY_DSN);

/**
 * Crash reporting for release builds. No-op until a DSN is configured.
 * PII is disabled because this app handles health data.
 */
export function initCrashReporting() {
  if (!isCrashReportingEnabled) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__,
    sendDefaultPii: false,
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
    enableCaptureFailedRequests: false,
  });
}

/** Tag events with the signed-in role/id without attaching name, email or phone. */
export function setCrashReportingUser(user: {id: string; role: string} | null) {
  if (!isCrashReportingEnabled) {
    return;
  }
  Sentry.setUser(user ? {id: user.id, segment: user.role} : null);
}

export function wrapWithCrashReporting<T>(component: T): T {
  return isCrashReportingEnabled ? (Sentry.wrap(component as never) as T) : component;
}
