export type SymptomDuration = {
  id: string;
  label: string;
};

export const SYMPTOM_DURATIONS: SymptomDuration[] = [
  {id: 'few-days', label: 'For 2–3 days'},
  {id: 'week-plus', label: '1+ Week'},
];

export const SYMPTOM_DURATION_QUESTION =
  'How long have you been feeling this way?';
