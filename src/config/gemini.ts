/**
 * Copy this file to `gemini.ts` and paste the real key in.
 *
 * `gemini.ts` is gitignored — same arrangement as `googleMaps.ts`.
 *
 * The type annotation is deliberate: without it TypeScript narrows the const to
 * its literal string, and the "is this still the placeholder?" guard in
 * geminiService.ts becomes a comparison with no overlap (a tsc error).
 */
export const GEMINI_API_KEY: string = 'AQ.Ab8RN6LwsBQHihLKsXwaOLdtIRNnGCQoEjv5vYK1X0A90BgAxQ';
