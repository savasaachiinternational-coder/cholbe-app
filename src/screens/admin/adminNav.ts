export type AdminTabKey =
  | 'home'
  | 'orders'
  | 'vendors'
  | 'medicine'
  | 'payments'
  | 'report'
  | 'user'
  | 'inventory'
  | 'profile';

export const ADMIN_TABS: {
  key: AdminTabKey;
  label: string;
  icon:
    | 'home'
    | 'file-text'
    | 'activity'
    | 'pie-chart'
    | 'user'
    | 'users'
    | 'credit-card'
    | 'archive';
  materialIcon?: 'supervised-user-circle';
}[] = [
  {key: 'home', label: 'Home', icon: 'home'},
  {key: 'orders', label: 'Orders', icon: 'file-text'},
  {key: 'vendors', label: 'Vendors', icon: 'home', materialIcon: 'supervised-user-circle'},
  {key: 'medicine', label: 'Medicine', icon: 'activity'},
  {key: 'payments', label: 'Payments', icon: 'credit-card'},
  {key: 'report', label: 'Report', icon: 'pie-chart'},
  {key: 'user', label: 'User', icon: 'users'},
  {key: 'inventory', label: 'Inventory', icon: 'archive'},
  {key: 'profile', label: 'Profile', icon: 'user'},
];

export const ADMIN_ORDER_FILTERS = [
  'All',
  'Pending',
  'Processing',
  'Delivered',
  'Cancelled',
] as const;

export type AdminOrderFilter = (typeof ADMIN_ORDER_FILTERS)[number];
export type AdminOrderStatus = 'Delivered' | 'Processing' | 'Pending' | 'Cancelled';

export const ADMIN_VENDOR_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'] as const;
export type AdminVendorFilter = (typeof ADMIN_VENDOR_FILTERS)[number];

export const ADMIN_MEDICINE_FILTERS = ['All', 'Active', 'Inactive', 'Out of Stock'] as const;
export type AdminMedicineFilter = (typeof ADMIN_MEDICINE_FILTERS)[number];

export const ADMIN_USER_FILTERS = [
  'All',
  'Customers',
  'Vendors',
  'Doctors',
  'Specialties',
  'Blocked',
] as const;
export type AdminUserFilter = (typeof ADMIN_USER_FILTERS)[number];
