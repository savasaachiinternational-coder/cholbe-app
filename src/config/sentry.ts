/**
 * Sentry DSN. Safe to commit (a DSN only allows sending events, not reading them).
 * Leave empty to disable crash reporting entirely.
 */
export const SENTRY_DSN = '';

/** Fraction of transactions sampled for performance tracing. */
export const SENTRY_TRACES_SAMPLE_RATE = 0;
