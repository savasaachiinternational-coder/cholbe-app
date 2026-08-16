export type SavedPrescriptionType =
  | 'prescription_bengali'
  | 'prescription_english'
  | 'prescription_clear'
  | 'doctor'
  | 'kit'
  | 'surgery'
  | 'surgery_2'
  | 'pharmacy_counter'
  | 'prescription_english_2';

export type SavedPrescriptionItem = {
  id: string;
  type: SavedPrescriptionType;
};

export const SAVED_PRESCRIPTION_ROW1: SavedPrescriptionItem[] = [
  {id: 'r1-1', type: 'prescription_bengali'},
  {id: 'r1-2', type: 'prescription_english'},
  {id: 'r1-3', type: 'prescription_clear'},
];

export const SAVED_PRESCRIPTION_GRID: SavedPrescriptionItem[] = [
  {id: 'c-1', type: 'doctor'},
  {id: 'c-2', type: 'kit'},
  {id: 'c-3', type: 'surgery'},
  {id: 'c-4', type: 'surgery_2'},
  {id: 'c-5', type: 'prescription_clear'},
  {id: 'c-6', type: 'pharmacy_counter'},
  {id: 'c-7', type: 'prescription_english'},
  {id: 'c-8', type: 'prescription_english_2'},
  {id: 'c-9', type: 'doctor'},
  {id: 'c-10', type: 'kit'},
  {id: 'c-11', type: 'surgery'},
];
