export type Medicine = {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
};

export type LabResult = {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
};

export type PrescriptionReport = {
  documentType: 'PRESCRIPTION';
  patientName?: string;
  doctorName?: string;
  medicines: Medicine[];
};

export type DiagnosticReport = {
  documentType: 'LAB_REPORT';
  patientName?: string;
  labName?: string;
  results: LabResult[];
};

/**
 * Discriminated on `documentType`, so narrowing on that field gives the caller
 * either `medicines` or `results` — never both, never neither.
 */
export type ScannedDocument = PrescriptionReport | DiagnosticReport;

export const DOC_SCANNER_TITLE = 'Scan a medical document';

export const DOC_SCANNER_SUBTITLE =
  'Upload a prescription or a lab report and I will pull out the details for you.';

export const DOC_SCANNER_CTA_LABEL = 'Select prescription or lab report';

export const DOC_SCANNER_EMPTY_HINT =
  'Nothing scanned yet. Pick a clear, well-lit photo of the whole page for the best reading.';

/**
 * Shown under every result. Extraction is best-effort OCR by a language model —
 * it can misread a dosage, and that is not a risk to leave implicit in a health
 * app.
 */
export const DOC_SCANNER_DISCLAIMER =
  'Automatically extracted and may contain mistakes. Always check against the original document before acting on it.';
