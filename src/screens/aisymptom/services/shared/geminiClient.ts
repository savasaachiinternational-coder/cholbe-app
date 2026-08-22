import {GEMINI_API_KEY} from '../../../../config/gemini';

const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const PLACEHOLDER_KEY = 'your_gemini_api_key_here';

export class GeminiError extends Error {}

type GeminiResponse = {
  candidates?: {
    content?: {parts?: {text?: string; thought?: boolean}[]};
    finishReason?: string;
  }[];
  promptFeedback?: {blockReason?: string};
  error?: {message?: string; status?: string};
};

/** A single user part — text, or an inlined image for the vision calls. */
export type GeminiPart =
  | {text: string}
  | {inline_data: {mime_type: string; data: string}};

type JsonRequest = {
  systemInstruction: string;
  parts: GeminiPart[];
  /** Gemini response schema — forces the model into a fixed JSON shape. */
  responseSchema: unknown;
};

/**
 * Calls Gemini in JSON mode and returns the parsed payload.
 *
 * Throws `GeminiError` with a message worth showing the user for every failure
 * mode: missing key, offline, blocked prompt, truncated answer, bad JSON.
 */
export async function generateJson<T>({
  systemInstruction,
  parts,
  responseSchema,
}: JsonRequest): Promise<T> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === PLACEHOLDER_KEY) {
    throw new GeminiError(
      'No Gemini API key configured. Add one to src/config/gemini.ts.',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        systemInstruction: {parts: [{text: systemInstruction}]},
        contents: [{role: 'user', parts}],
        // No temperature override on purpose. Gemini 3.x are thinking models
        // and Google advises leaving temperature at its default.
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
    });
  } catch {
    throw new GeminiError(
      'Could not reach Gemini. Check your internet connection.',
    );
  }

  const body = await response.text();
  let payload: GeminiResponse;
  try {
    payload = JSON.parse(body) as GeminiResponse;
  } catch {
    throw new GeminiError(`Unexpected response from Gemini (${response.status}).`);
  }

  if (!response.ok) {
    throw new GeminiError(
      payload.error?.message ?? `Gemini request failed (${response.status}).`,
    );
  }

  if (payload.promptFeedback?.blockReason) {
    throw new GeminiError(
      `Gemini declined that request (${payload.promptFeedback.blockReason}).`,
    );
  }

  const candidate = payload.candidates?.[0];
  // MAX_TOKENS or SAFETY here means the JSON is truncated or absent — parsing
  // it would fail with a far less useful message than the reason itself.
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    throw new GeminiError(`Gemini stopped early (${candidate.finishReason}).`);
  }

  // Gemini 3.x reasons before answering and may split the answer over several
  // parts, with `thought` parts carrying reasoning rather than output. Reading
  // parts[0] blindly yields a reasoning fragment or half of the JSON.
  const jsonText = (candidate?.content?.parts ?? [])
    .filter(part => part.text && !part.thought)
    .map(part => part.text)
    .join('');

  if (!jsonText) throw new GeminiError('Gemini returned an empty result.');

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new GeminiError('Gemini returned a malformed result.');
  }
}
