export type PreviousHistoryOption = {
  id: string;
  label: string;
  value: boolean;
};

export const PREVIOUS_HISTORY_OPTIONS: PreviousHistoryOption[] = [
  {id: 'yes', label: 'Yes', value: true},
  {id: 'no', label: 'No', value: false},
];

export const PREVIOUS_HISTORY_QUESTION = 'Have you had this symptom before?';
