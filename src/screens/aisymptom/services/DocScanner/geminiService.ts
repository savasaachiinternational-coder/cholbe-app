import {generateJson, GeminiError} from '../shared/geminiClient';
import type {
  LabResult,
  Medicine,
  ScannedDocument,
} from '../../data/DocScanner/medicalDocument';

export {GeminiError as DocScanError} from '../shared/geminiClient';

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
    medicines: {
      type: 'ARRAY',
      description: 'Every medicine on a prescription. Empty array for a lab report.',
      items: {
        type: 'OBJECT',
        properties: {
          name: {type: 'STRING', description: 'Medicine name'},
          dosage: {type: 'STRING', description: 'e.g. 500mg'},
          frequency: {type: 'STRING', description: 'e.g. three times daily'},
          duration: {type: 'STRING', description: 'e.g. 5 days'},
        },
        required: ['name'],
        propertyOrdering: ['name', 'dosage', 'frequency', 'duration'],
      },
    },
    labResults: {
      type: 'ARRAY',
      description: 'Every test result on a lab report. Empty array for a prescription.',
      items: {
        type: 'OBJECT',
        properties: {
          testName: {type: 'STRING'},
          value: {type: 'STRING'},
          unit: {type: 'STRING'},
          referenceRange: {type: 'STRING'},
          isAbnormal: {type: 'BOOLEAN'},
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
  const rawData = await generateJson<RawParsed>({
    systemInstruction: SYSTEM_CONTEXT,
    parts: [
      {inline_data: {mime_type: mimeType, data: base64Image}},
      {text: 'Parse this single medical document image.'},
    ],
    responseSchema: DYNAMIC_MEDICAL_SCHEMA,
  });

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

  throw new GeminiError(
    'That does not look like a prescription or a lab report.',
  );
}
