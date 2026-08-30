import { GeminiError, generateJson } from '../shared/geminiClient';

export { GeminiError as SymptomBriefError } from '../shared/geminiClient';

const SYSTEM_CONTEXT = `
You clean up raw OCR text scanned from a document a patient attached to a symptom checker.

Rewrite it as a short brief that keeps ONLY sickness-related information:
complaints and symptoms, diagnoses, medicines with their dose, frequency and
duration, test results with their units and reference ranges, and dates that
matter clinically.

Remove everything else: clinic or laboratory branding, addresses, phone numbers,
registration and invoice lines, prices, page numbers, signatures, and OCR noise.

Correct obvious OCR misreadings of medical terms, but never add a detail the
text does not contain and never guess at an unreadable value.

Write the brief in the language of the source text, as plain short lines the
patient could have typed themselves, in 120 words or fewer.

Set hasSicknessInfo to false and leave summary empty when the text contains no
sickness-related information at all.
`.trim();

const BRIEF_SCHEMA = {
  type: 'OBJECT',
  properties: {
    hasSicknessInfo: {
      type: 'BOOLEAN',
      description:
        'True only when the text holds at least one symptom, diagnosis, medicine or test result.',
    },
    summary: {
      type: 'STRING',
      description:
        'The polished sickness-only brief. Empty string when hasSicknessInfo is false. Never put commentary here.',
    },
  },
  required: ['hasSicknessInfo', 'summary'],
  propertyOrdering: ['hasSicknessInfo', 'summary'],
} as const;

type RawBrief = {
  hasSicknessInfo?: boolean;
  summary?: string;
};

function cleanOcrText(rawText: string): string {
  return rawText
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function fallbackBriefFromText(text: string): string | null {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const symptomLinePattern =
    /(pain|ache|fever|cough|nausea|vomit|bloat|stomach|headache|sore|fatigue|weak|dizzy|diarrh|constipat|gas|acid|burn|chest|breath|belch|tired|cramp)/i;
  const relevantLines = lines.filter(line => symptomLinePattern.test(line));
  const selectedLines = (relevantLines.length ? relevantLines : lines).slice(0, 3);

  return selectedLines.join(' ');
}

export async function briefSymptomText(rawText: string): Promise<string | null> {
  const text = cleanOcrText(rawText);
  if (!text) return null;

  let brief: RawBrief;
  try {
    brief = await generateJson<RawBrief>({
      systemInstruction: SYSTEM_CONTEXT,
      parts: [{ text: `OCR text from the attached document:\n\n${text}` }],
      responseSchema: BRIEF_SCHEMA,
    });
  } catch (err) {
    if (err instanceof GeminiError && /empty input/i.test(err.message)) {
      return fallbackBriefFromText(text);
    }
    throw err;
  }

  const summary = brief.summary?.trim();
  if (!brief.hasSicknessInfo || !summary) return null;
  return summary;
}
