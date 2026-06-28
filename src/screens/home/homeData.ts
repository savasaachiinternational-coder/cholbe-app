export type ScheduleTab =
  | 'all'
  | 'upcoming'
  | 'taken'
  | 'missed'
  | 'waitingRoom';

export type ScheduleItem = {
  id: string;
  name: string;
  detail: string;
  icon: 'pill' | 'insulin';
  active?: boolean;
  taken?: boolean;
  showDismiss?: boolean;
  showCheck?: boolean;
  scheduleId?: string;
  scheduledTime?: string;
};

export type ScheduleGroup = {
  time: string;
  items: ScheduleItem[];
};

export const SCHEDULE_TABS: {key: ScheduleTab; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'upcoming', label: 'Upcoming Medicine'},
  {key: 'waitingRoom', label: 'Waiting Room'},
  {key: 'taken', label: 'Taken'},
  {key: 'missed', label: 'Missed'},
];

export const SCHEDULE_GROUPS: ScheduleGroup[] = [
  {
    time: '7:30 am',
    items: [
      {
        id: '1',
        name: 'Omiprazole 20mg',
        detail: '• 2 Pls  • Before Eating',
        icon: 'pill',
        active: true,
        showDismiss: true,
      },
      {
        id: '2',
        name: 'Thyrox 50mg',
        detail: '• 2 Pls  • After Eating',
        icon: 'pill',
        showDismiss: true,
      },
      {
        id: '3',
        name: 'Insulin',
        detail: '• Before Eating',
        icon: 'insulin',
        showDismiss: true,
      },
    ],
  },
  {
    time: '12:30 am',
    items: [
      {
        id: '4',
        name: 'Omiprazole 20mg',
        detail: '• 2 Pls  • Before Eating',
        icon: 'pill',
        showDismiss: true,
      },
      {
        id: '5',
        name: 'Thyrox 50mg',
        detail: '• 2 Pls  • Before Eating',
        icon: 'pill',
        showDismiss: false,
      },
    ],
  },
];

export type RelatedProduct = {
  id: string;
  title: string;
  subtitle: string;
  volume: string;
  price: string;
  originalPrice: string;
  discount: string;
  image: number;
};

export const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: '1',
    title: 'Immunity support',
    subtitle: 'Vitamin C + Zinc',
    volume: '60 ml',
    price: '$120',
    originalPrice: '$10',
    discount: '-10%',
    image: require('../../assets/b4.png'),
  },
  {
    id: '2',
    title: 'Immunity support',
    subtitle: 'Vitamin C + Zinc',
    volume: '60 ml',
    price: '$120',
    originalPrice: '$10',
    discount: '-10%',
    image: require('../../assets/b3.png'),
  },
];

export type BottomTabKey =
  | 'home'
  | 'pharmacy'
  | 'medication'
  | 'report'
  | 'profile';

export const BOTTOM_TABS: {
  key: BottomTabKey;
  label: string;
  icon: 'home' | 'plus-square' | 'activity' | 'file-text' | 'user';
}[] = [
  {key: 'home', label: 'Home', icon: 'home'},
  {key: 'pharmacy', label: 'Pharmacy', icon: 'plus-square'},
  {key: 'medication', label: 'Medication', icon: 'activity'},
  {key: 'report', label: 'Report', icon: 'file-text'},
  {key: 'profile', label: 'Profile', icon: 'user'},
];
