import {generateJson} from '../shared/geminiClient';

export {GeminiError as SymptomBriefError} from '../shared/geminiClient';

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
  // Ordered so the model commits to the verdict before writing the summary.
  required: ['hasSicknessInfo', 'summary'],
  propertyOrdering: ['hasSicknessInfo', 'summary'],
} as const;

type RawBrief = {
  hasSicknessInfo?: boolean;
  summary?: string;
};

/**
 * Polishes OCR text down to the sickness-related part.
 *
 * Returns null when the document holds nothing health-related, so the caller
 * can say so rather than dropping a page of letterhead into the composer.
 * Throws `SymptomBriefError` when Gemini could not be reached or refused.
 */
export async function briefSymptomText(rawText: string): Promise<string | null> {
  const text = rawText.trim();
  if (!text) return null;

  const brief = await generateJson<RawBrief>({
    systemInstruction: SYSTEM_CONTEXT,
    parts: [{text: `OCR text from the attached document:\n\n${text}`}],
    responseSchema: BRIEF_SCHEMA,
  });

  const summary = brief.summary?.trim();
  // Trust the flag, but an empty summary means the same thing either way.
  if (!brief.hasSicknessInfo || !summary) return null;
  return summary;
}
