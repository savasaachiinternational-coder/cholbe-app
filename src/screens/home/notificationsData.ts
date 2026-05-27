export type NotificationFilterTab = 'all' | 'reminders' | 'alerts';

export type NotificationCategory =
  | 'medication'
  | 'missed_dose'
  | 'followup'
  | 'managed';

export type ManagedMember = {
  name: string;
  relation: string;
  avatar: number;
};

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  body?: string;
  time?: string;
  showMarkTaken?: boolean;
  managedMember?: ManagedMember;
};

export type NotificationSection = {
  id: string;
  dateLabel: string;
  items: NotificationItem[];
};

const MEMBER_AVATAR = require('../../assets/b2.png');

export const NOTIFICATION_SECTIONS: NotificationSection[] = [
  {
    id: 'today',
    dateLabel: 'Today, Apr 25, 2026',
    items: [
      {
        id: 't1',
        category: 'medication',
        title: 'Time to take Atorvastatin 20mg',
        body: "It's time for your evening medication.",
        time: '10:30 AM',
        showMarkTaken: true,
      },
      {
        id: 't2',
        category: 'missed_dose',
        title: 'Missed Dose Alert',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
      {
        id: 't3',
        category: 'followup',
        title: 'Follow-up Appointment',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
    ],
  },
  {
    id: 'yesterday-1',
    dateLabel: 'Yesterday, Apr 24, 2026',
    items: [
      {
        id: 'y1',
        category: 'medication',
        title: 'Time to take Atorvastatin 20mg',
        body: "It's time for your evening medication.",
        time: '10:30 AM',
        showMarkTaken: true,
      },
      {
        id: 'y2',
        category: 'missed_dose',
        title: 'Missed Dose Alert',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
      {
        id: 'y3',
        category: 'managed',
        title: 'Follow-up Appointment',
        managedMember: {
          name: 'Mehidi Hassan',
          relation: 'Brother',
          avatar: MEMBER_AVATAR,
        },
      },
    ],
  },
  {
    id: 'yesterday-2',
    dateLabel: 'Yesterday, Apr 24, 2026',
    items: [
      {
        id: 'y4',
        category: 'medication',
        title: 'Time to take Atorvastatin 20mg',
        body: "It's time for your evening medication.",
        time: '10:30 AM',
        showMarkTaken: true,
      },
      {
        id: 'y5',
        category: 'missed_dose',
        title: 'Missed Dose Alert',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
      {
        id: 'y6',
        category: 'missed_dose',
        title: 'Missed Dose Alert',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
      {
        id: 'y7',
        category: 'missed_dose',
        title: 'Missed Dose Alert',
        body: "It looks like you missed your Amlodipine 5mg dose this morning. Please don't forget to take your medications!",
        time: '10:30 AM',
      },
    ],
  },
];

export function matchesNotificationTab(
  category: NotificationCategory,
  tab: NotificationFilterTab,
): boolean {
  if (tab === 'all') {
    return true;
  }
  if (tab === 'reminders') {
    return category === 'medication' || category === 'followup';
  }
  return category === 'missed_dose';
}
