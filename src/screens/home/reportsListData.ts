export type ReportListItem = {
  id: string;
  title: string;
  source: string;
  time: string;
  isLatest: boolean;
};

export const REPORT_LIST_ITEMS: ReportListItem[] = [
  {
    id: '1',
    title: 'Blood Test Results',
    source: 'Devcare Lab',
    time: '2:45 PM',
    isLatest: true,
  },
  {
    id: '2',
    title: 'Doctor Notes',
    source: 'Dr. Ahmed',
    time: '2:45 PM',
    isLatest: false,
  },
  {
    id: '3',
    title: 'X-Ray Reports',
    source: 'Devcare Lab',
    time: '2:45 PM',
    isLatest: false,
  },
  {
    id: '4',
    title: 'MRI Reports',
    source: 'Devcare Lab',
    time: '2:45 PM',
    isLatest: false,
  },
];
