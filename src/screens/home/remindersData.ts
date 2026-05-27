export type ReminderSegmentTab = 'all' | 'reminders' | 'alerts';

export type ReminderItem = {
  switchKey: string;
  medicine: string;
  time: string;
  frequency: string;
};

export type ReminderSection = {
  id: string;
  label: string;
  items: ReminderItem[];
};

export const REMINDER_SECTIONS: ReminderSection[] = [
  {
    id: 'morning',
    label: 'Morning',
    items: [
      {
        switchKey: 'm1',
        medicine: 'Amlodipine 20mg',
        time: '8:00 AM',
        frequency: 'Once daily, Every day',
      },
    ],
  },
  {
    id: 'evening',
    label: 'Evening',
    items: [
      {
        switchKey: 'e1',
        medicine: 'Amlodipine 20mg',
        time: '8:00 PM',
        frequency: 'Once daily, Every day',
      },
      {
        switchKey: 'e2',
        medicine: 'Amlodipine 20mg',
        time: '8:00 PM',
        frequency: 'Once daily, Every day',
      },
      {
        switchKey: 'e3',
        medicine: 'Amlodipine 20mg',
        time: '8:00 PM',
        frequency: 'Once daily, Every day',
      },
    ],
  },
  {
    id: 'night',
    label: 'Night',
    items: [
      {
        switchKey: 'n1',
        medicine: 'Amlodipine 20mg',
        time: '10:00 PM',
        frequency: 'Once daily, Every day',
      },
      {
        switchKey: 'n2',
        medicine: 'Amlodipine 20mg',
        time: '10:00 PM',
        frequency: 'Once daily, Every day',
      },
      {
        switchKey: 'n3',
        medicine: 'Amlodipine 20mg',
        time: '10:00 PM',
        frequency: 'Once daily, Every day',
      },
    ],
  },
];

export const INITIAL_SWITCH_STATE: Record<string, boolean> = {
  m1: true,
  e1: true,
  e2: true,
  e3: true,
  n1: true,
  n2: true,
  n3: true,
  masterReminders: true,
};

export const SWITCH_TRACK = {false: '#CBD5E1', true: '#2DD4BF'} as const;
