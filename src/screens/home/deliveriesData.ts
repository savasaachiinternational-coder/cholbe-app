export const DELIVERY_COLORS = {
  background: '#F6F5FA',
  white: '#FFFFFF',
  textDark: '#2D3142',
  textMuted: '#9094A6',
  primaryMint: '#4CB5AB',
  mintBg: '#E9F7F5',
  borderLight: '#EAEBF0',
  floatingBtn: '#A3EAD8',
  tabActive: '#4CB5AB',
  tabInactive: '#9094A6',
};

export const NEXT_DELIVERY = {
  title: 'Next Delivery',
  dateLabel: '12 Feb of the month',
  countdownLabel: 'in 5 days',
  status: 'Scheduled',
};

export const DELIVERY_MEDICINES = [
  {id: '1', name: 'Amlodipine 5mg'},
  {id: '2', name: 'Amlodipine 5mg'},
  {id: '3', name: 'Amlodipine 5mg'},
];

export const DELIVERY_INFO = {
  deliveryTime: 'Same Day',
  payment: 'Cash on Delivery',
};

export const DELIVERY_ACTIONS = [
  {id: 'pause', label: 'Pause Delivery', icon: 'pause-circle' as const},
  {id: 'date', label: 'Change Date', icon: 'calendar' as const},
  {id: 'contact', label: 'Contact Pharmacy', icon: 'phone' as const},
];
