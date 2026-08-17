export type MedicationFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type MedicationStrength =
  | '2.5mg'
  | '5mg'
  | '10mg'
  | '12.5mg'
  | '20mg'
  | '25mg'
  | '40mg'
  | '50mg'
  | '100mg'
  | '200mg'
  | '250mg'
  | '500mg'
  | '1000mg';

export type MedicationSource = 'manual' | 'camera' | 'gallery' | 'saved';

export type MedicationDraft = {
  medicineName: string;
  dose: string;
  instruction: string;
  mealTiming: 'before' | 'after';
  times: string[];
  frequency: MedicationFrequency;
  startDate: string;
  endDate: string;
  reminderEnabled: boolean;
  reminderBeforeMinutes: number;
  followUpEnabled: boolean;
  followUpMinutes: number;
  followUpTime: string;
  refillEnabled: boolean;
  inventoryCount: number;
  refillDate: string;
  refillTime: string;
  caregiverName: string;
  prescriptionId?: string;
  fileUrl?: string;
  fileName?: string;
  source?: MedicationSource;
};

export const FREQUENCY_OPTIONS: {value: MedicationFrequency; label: string}[] = [
  {value: 'once_daily', label: 'Once daily'},
  {value: 'twice_daily', label: '2 times daily'},
  {value: 'three_times_daily', label: '3 times daily'},
  {value: 'weekly', label: 'Weekly'},
  {value: 'monthly', label: 'Monthly'},
  {value: 'custom', label: 'Custom'},
];

export const REMINDER_MINUTE_OPTIONS = [
  {value: 10, label: '10 min before'},
  {value: 30, label: '30 min before'},
  {value: 60, label: '1 Hour Before'},
];

export const INVENTORY_OPTIONS = [5, 10, 15, 20, 30, 50];

// Ordered list for the Strength picker. Kept in the same order as the union so
// the dropdown reads low-to-high.
export const STRENGTH_OPTIONS: MedicationStrength[] = [
  '2.5mg',
  '5mg',
  '10mg',
  '12.5mg',
  '20mg',
  '25mg',
  '40mg',
  '50mg',
  '100mg',
  '200mg',
  '250mg',
  '500mg',
  '1000mg',
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthLaterIso() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function createDefaultMedicationDraft(
  overrides: Partial<MedicationDraft> = {},
): MedicationDraft {
  return {
    medicineName: '',
    dose: '',
    instruction: 'custom',
    mealTiming: 'before',
    times: ['08:30 AM'],
    frequency: 'once_daily',
    startDate: todayIso(),
    endDate: monthLaterIso(),
    reminderEnabled: true,
    reminderBeforeMinutes: 30,
    followUpEnabled: true,
    followUpMinutes: 30,
    followUpTime: '08:30 AM',
    refillEnabled: true,
    inventoryCount: 10,
    refillDate: monthLaterIso(),
    refillTime: '08:30 AM',
    caregiverName: '',
    ...overrides,
  };
}

export function formatDisplayDate(iso?: string) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}-${month}-${year}`;
}

export function formatFrequencyLabel(frequency?: string) {
  return (
    FREQUENCY_OPTIONS.find(option => option.value === frequency)?.label ??
    'Once daily'
  );
}

export function formatMealTimingLabel(value?: string) {
  if (value === 'before') return 'Before Meal';
  if (value === 'after') return 'After Meal';
  return value ?? '—';
}

export function draftToSchedulePayload(draft: MedicationDraft) {
  return {
    medicineName: draft.medicineName.trim(),
    dose: draft.dose.trim() || undefined,
    instruction: draft.instruction || undefined,
    mealTiming: draft.mealTiming,
    times: draft.times.filter(Boolean),
    frequency: draft.frequency,
    startDate: draft.startDate || undefined,
    endDate: draft.endDate || undefined,
    reminderEnabled: draft.reminderEnabled,
    reminderBeforeMinutes: draft.reminderEnabled
      ? draft.reminderBeforeMinutes
      : undefined,
    followUpEnabled: draft.followUpEnabled,
    followUpMinutes: draft.followUpEnabled ? draft.followUpMinutes : undefined,
    followUpTime: draft.followUpEnabled ? draft.followUpTime : undefined,
    refillEnabled: draft.refillEnabled,
    inventoryCount: draft.refillEnabled ? draft.inventoryCount : undefined,
    refillDate: draft.refillEnabled ? draft.refillDate || undefined : undefined,
    refillTime: draft.refillEnabled ? draft.refillTime : undefined,
    caregiverName: draft.caregiverName.trim() || undefined,
    prescriptionId: draft.prescriptionId,
  };
}
