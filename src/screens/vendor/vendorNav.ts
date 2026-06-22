export type VendorTabKey = 'home' | 'inventory' | 'orders' | 'payments' | 'profile';

export const VENDOR_TABS: {
  key: VendorTabKey;
  label: string;
  icon: 'home' | 'archive' | 'shopping-bag' | 'credit-card' | 'user';
}[] = [
  {key: 'home', label: 'Home', icon: 'home'},
  {key: 'inventory', label: 'Inventory', icon: 'archive'},
  {key: 'orders', label: 'Orders', icon: 'shopping-bag'},
  {key: 'payments', label: 'Payments', icon: 'credit-card'},
  {key: 'profile', label: 'Profile', icon: 'user'},
];

export const FILTER_CATEGORIES = ['All Items', 'Medicines', "Women's Care", 'Body Care'];

export const ORDER_FILTER_CHIPS = ['Accepted', 'Declined', 'Pending', 'Last 1 Weeks'] as const;
export type OrderFilterChip = (typeof ORDER_FILTER_CHIPS)[number];

export type VendorOrderStatus = 'Pending' | 'Accepted' | 'Delivered';

export const PAYMENT_DATE_FILTERS = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'All Time',
] as const;
export const PAYMENT_STATUS_FILTERS = ['All Statuses', 'Paid', 'Pending'] as const;

export type PaymentDateFilter = (typeof PAYMENT_DATE_FILTERS)[number];
export type PaymentStatusFilter = (typeof PAYMENT_STATUS_FILTERS)[number];

export const PRODUCT_CATEGORIES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler'] as const;
export const UNIT_TYPES = ['Box', 'Stripe', 'Piece', 'Bottle'] as const;
export const TEMPERATURE_OPTIONS = [
  'Room Temp (20-25°C)',
  'Refrigerated (2-8°C)',
  'Frozen (-18°C)',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type UnitType = (typeof UNIT_TYPES)[number];
export type TemperatureOption = (typeof TEMPERATURE_OPTIONS)[number];
