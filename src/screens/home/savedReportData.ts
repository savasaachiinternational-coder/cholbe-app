export type SavedReportType =
  | 'report_document_bengali'
  | 'report_document_english'
  | 'report_document_clear'
  | 'lab_tech'
  | 'microscope'
  | 'clinic_room'
  | 'hospital_bed'
  | 'diagnostic_counter'
  | 'report_document_english_2';

export type SavedReportItem = {
  id: string;
  type: SavedReportType;
};

export const SAVED_REPORT_ROW1: SavedReportItem[] = [
  {id: 'rep1-1', type: 'report_document_bengali'},
  {id: 'rep1-2', type: 'report_document_english'},
  {id: 'rep1-3', type: 'report_document_clear'},
];

export const SAVED_REPORT_GRID: SavedReportItem[] = [
  {id: 'crep-1', type: 'lab_tech'},
  {id: 'crep-2', type: 'microscope'},
  {id: 'crep-3', type: 'clinic_room'},
  {id: 'crep-4', type: 'hospital_bed'},
  {id: 'crep-5', type: 'report_document_clear'},
  {id: 'crep-6', type: 'diagnostic_counter'},
  {id: 'crep-7', type: 'report_document_english'},
  {id: 'crep-8', type: 'report_document_english_2'},
  {id: 'crep-9', type: 'lab_tech'},
  {id: 'crep-10', type: 'microscope'},
  {id: 'crep-11', type: 'clinic_room'},
];
