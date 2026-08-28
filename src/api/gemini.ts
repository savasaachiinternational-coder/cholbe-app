import {apiRequest, ApiError} from './client';

/** A single user part — text, or an inlined image for the vision calls. */
export type GeminiPart =
  | {text: string}
  | {inline_data: {mime_type: string; data: string}};

export class GeminiError extends Error {}

type JsonRequest = {
  systemInstruction: string;
  parts: GeminiPart[];
  responseSchema: unknown;
};

/**
 * Calls Gemini in JSON mode via the backend proxy and returns the parsed payload.
 */
export async function generateJson<T>({
  systemInstruction,
  parts,
  responseSchema,
}: JsonRequest): Promise<T> {
  try {
    return await apiRequest<T>('/gemini/generate-json', {
      method: 'POST',
      auth: true,
      body: {systemInstruction, parts, responseSchema},
    });
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GeminiError(err.message);
    }
    throw new GeminiError('Could not reach Gemini. Check your internet connection.');
  }
}
