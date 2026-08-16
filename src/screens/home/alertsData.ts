export type AlertSegmentTab = 'all' | 'reminders' | 'alerts';

export type AlertItem = {
  id: string;
  title: string;
  description: string;
  time: string;
};

export const ALERTS_DATE_LABEL = 'Today, Apr 25, 2026';

export const ALERTS_LIST: AlertItem[] = [
  {
    id: '1',
    title: 'Missed Dose Alert',
    description:
      "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
    time: '10:30 AM',
  },
  {
    id: '2',
    title: 'Missed Dose Alert',
    description:
      "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
    time: '10:30 AM',
  },
  {
    id: '3',
    title: 'Missed Dose Alert',
    description:
      "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
    time: '10:30 AM',
  },
  {
    id: '4',
    title: 'Missed Dose Alert',
    description:
      "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
    time: '10:30 AM',
  },
];
