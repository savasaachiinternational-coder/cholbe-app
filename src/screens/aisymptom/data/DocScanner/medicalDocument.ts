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

export type ScannedDocument = PrescriptionReport | DiagnosticReport;

export const DOC_SCANNER_TITLE = 'Scan a medical document';

export const DOC_SCANNER_SUBTITLE =
  'Upload a prescription or a lab report and I will pull out the details for you.';

export const DOC_SCANNER_CTA_LABEL = 'Select prescription or lab report';

export const DOC_SCANNER_EMPTY_HINT =
  'Nothing scanned yet. Pick a clear, well-lit photo of the whole page for the best reading.';

export const DOC_SCANNER_DISCLAIMER =
  'Automatically extracted and may contain mistakes. Always check against the original document before acting on it.';
