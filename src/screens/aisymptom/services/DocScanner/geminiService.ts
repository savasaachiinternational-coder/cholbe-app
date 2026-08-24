import { GEMINI_API_KEY } from '../../../../config/gemini';
import type {
  LabResult,
  Medicine,
  ScannedDocument,
} from '../../data/DocScanner/medicalDocument';


const MODEL = 'gemini-3.6-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const PLACEHOLDER_KEY = 'your_gemini_api_key_here';


const DYNAMIC_MEDICAL_SCHEMA = {
  type: 'OBJECT',
  properties: {
    documentType: {
      type: 'STRING',
      enum: ['PRESCRIPTION', 'LAB_REPORT'],
      description:
        'PRESCRIPTION for a doctor prescription, LAB_REPORT for a laboratory test report.',
    },
    patientName: {
      type: 'STRING',
      description:
        "The patient's name exactly as printed. Empty string if not present. Never put commentary here.",
    },
    doctorOrLabName: {
      type: 'STRING',
      description:
        'The prescribing doctor or the laboratory name exactly as printed. Empty string if not present.',
    },

    // Prescription-specific fields
    medicines: {
      type: 'ARRAY',
      description: 'Every medicine on a prescription. Empty array for a lab report.',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Medicine name' },
          dosage: { type: 'STRING', description: 'e.g. 500mg' },
          frequency: { type: 'STRING', description: 'e.g. three times daily' },
          duration: { type: 'STRING', description: 'e.g. 5 days' },
        },
        required: ['name'],
        propertyOrdering: ['name', 'dosage', 'frequency', 'duration'],
      },
    },

    // Lab-report specific fields
    labResults: {
      type: 'ARRAY',
      description: 'Every test result on a lab report. Empty array for a prescription.',
      items: {
        type: 'OBJECT',
        properties: {
          testName: { type: 'STRING' },
          value: { type: 'STRING' },
          unit: { type: 'STRING' },
          referenceRange: { type: 'STRING' },
          isAbnormal: { type: 'BOOLEAN' },
        },
        required: ['testName', 'value'],
        propertyOrdering: [
          'testName',
          'value',
          'unit',
          'referenceRange',
          'isAbnormal',
        ],
      },
    },
  },
  // Every field is required, and ordered so the model commits to a
  // documentType before it starts filling the branch-specific arrays.
  // Leaving `medicines`/`labResults` optional let the model skip them entirely.
  required: [
    'documentType',
    'patientName',
    'doctorOrLabName',
    'medicines',
    'labResults',
  ],
  propertyOrdering: [
    'documentType',
    'patientName',
    'doctorOrLabName',
    'medicines',
    'labResults',
  ],
} as const;


const SYSTEM_CONTEXT = `
You extract data from medical documents.
Analyze the image and detect whether it is a Doctor Prescription OR a Lab Test Report.
Output ONLY the requested JSON fields. Never write explanations, reasoning, or commentary inside any field value.
Do NOT populate lab results for prescriptions or medicines for lab reports — leave the other array empty.
`.trim();

export class DocScanError extends Error { }

type GeminiResponse = {
  candidates?: {
    content?: {
       parts?:
        { text?: string; 
          thought?: boolean 
        }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
};

type RawParsed = {
  documentType?: string;
  patientName?: string;
  doctorOrLabName?: string;
  medicines?: Medicine[];
  labResults?: LabResult[];
};


function optional(value: string | undefined) {
  return value?.trim() ? value.trim() : undefined;
}

/** Drops entries the model returned without the fields the UI needs. */
function cleanMedicines(items: Medicine[] | undefined): Medicine[] {
  return (items ?? []).filter(item => item?.name?.trim());
}

function cleanLabResults(items: LabResult[] | undefined): LabResult[] {
  return (items ?? []).filter(item => item?.testName?.trim());
}

export async function processSingleDocument(
  base64Image: string,
  mimeType: string = 'image/jpeg',
): Promise<ScannedDocument> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === PLACEHOLDER_KEY) {
    throw new DocScanError(
      'No Gemini API key configured. Add one to src/config/gemini.ts.',
    );
  }

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_CONTEXT }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Image } },
              { text: 'Parse this single medical document image.' },
            ],
          },
        ],
        // No temperature override on purpose. Gemini 3.x are thinking models
        // and Google advises leaving temperature at its default; forcing it to
        // 0.1 here made the output degenerate rather than more deterministic.
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: DYNAMIC_MEDICAL_SCHEMA,
        },
      }),
    });
  } catch {
    throw new DocScanError(
      'Could not reach Gemini. Check your internet connection.',
    );
  }

  const text = await response.text();
  let payload: GeminiResponse;
  try {
    payload = JSON.parse(text) as GeminiResponse;
  } catch {
    throw new DocScanError(`Unexpected response from Gemini (${response.status}).`);
  }

  if (!response.ok) {
    throw new DocScanError(
      payload.error?.message ?? `Gemini request failed (${response.status}).`,
    );
  }

  if (payload.promptFeedback?.blockReason) {
    throw new DocScanError(
      `Gemini declined to read that image (${payload.promptFeedback.blockReason}).`,
    );
  }

  const candidate = payload.candidates?.[0];
  // MAX_TOKENS or SAFETY here means the JSON is truncated or absent — parsing it
  // would fail with a far less useful message than the reason itself.
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    throw new DocScanError(
      `Gemini stopped early (${candidate.finishReason}). Try a clearer or smaller image.`,
    );
  }

  // Gemini 3.x reasons before answering and may split the answer over several
  // parts, with `thought` parts carrying reasoning rather than output. Reading
  // parts[0] blindly yields a reasoning fragment or half of the JSON.
  const jsonText = (candidate?.content?.parts ?? [])
    .filter(part => part.text && !part.thought)
    .map(part => part.text)
    .join('');

  if (!jsonText) {
    throw new DocScanError('Failed to extract document contents.');
  }

  let rawData: RawParsed;
  try {
    rawData = JSON.parse(jsonText) as RawParsed;
  } catch {
    throw new DocScanError('Gemini returned a malformed result.');
  }

  // Normalize into the strong TypeScript discriminator types.
  if (rawData.documentType === 'PRESCRIPTION') {
    return {
      documentType: 'PRESCRIPTION',
      patientName: optional(rawData.patientName),
      doctorName: optional(rawData.doctorOrLabName),
      medicines: cleanMedicines(rawData.medicines),
    };
  }

  if (rawData.documentType === 'LAB_REPORT') {
    return {
      documentType: 'LAB_REPORT',
      patientName: optional(rawData.patientName),
      labName: optional(rawData.doctorOrLabName),
      results: cleanLabResults(rawData.labResults),
    };
  }

  // `documentType` is schema-required, so an absent one means the model could
  // not classify the page at all rather than that it picked the other branch.
  throw new DocScanError(
    'That does not look like a prescription or a lab report.',
  );
}
