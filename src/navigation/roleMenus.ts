import type {ComponentProps} from 'react';
import type Feather from 'react-native-vector-icons/Feather';
import type {RootStackParamList} from './types';
import type {AppRole} from './roleRoutes';

export type RoleMenuItem = {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  /**
   * Every route listed here is param-free, which is what lets the drawer
   * navigate to any of them without knowing anything about the current screen.
   * The one exception is the admin AUsers shortcuts below, which pass a filter.
   */
  route: keyof RootStackParamList;
  /** Only used by the admin "Doctors"/"Specialties" shortcuts into AUsers. */
  userFilter?: 'Doctors' | 'Specialties';
};

const CUSTOMER_MENU: RoleMenuItem[] = [
  {label: 'Home', icon: 'home', route: 'Home'},
  {label: 'Pharmacy', icon: 'shopping-bag', route: 'PharmacyShop'},
  {label: 'My Medications', icon: 'activity', route: 'MedicineList'},
  {label: 'My Reports', icon: 'file-text', route: 'ReportsList'},
  {label: 'Appointments', icon: 'calendar', route: 'MyAppointment'},
  {label: 'Find a Doctor', icon: 'user-plus', route: 'DoctorList'},
  {label: 'AI Assistant', icon: 'zap', route: 'AiSymptomHome'},
  {label: 'Order History', icon: 'package', route: 'OrderListHistory'},
  {label: 'Deliveries', icon: 'truck', route: 'Deliveries'},
  {label: 'Reminders', icon: 'clock', route: 'Reminders'},
  {label: 'Alerts', icon: 'bell', route: 'Alerts'},
  {label: 'Profile', icon: 'user', route: 'MyProfile'},
];

const VENDOR_MENU: RoleMenuItem[] = [
  {label: 'Dashboard', icon: 'home', route: 'VHome'},
  {label: 'Inventory', icon: 'archive', route: 'VInventory'},
  {label: 'Add Product', icon: 'plus-square', route: 'VAddProduct'},
  {label: 'Orders', icon: 'shopping-bag', route: 'VOrders'},
  {label: 'Payments', icon: 'credit-card', route: 'VPayments'},
  {label: 'Pharmacy Profile', icon: 'user', route: 'VProfile'},
];

const DOCTOR_MENU: RoleMenuItem[] = [
  {label: 'Dashboard', icon: 'home', route: 'DHome'},
  {label: 'Appointments', icon: 'calendar', route: 'DAppointments'},
  {label: 'Patients', icon: 'users', route: 'DPatients'},
  {label: 'Consultations', icon: 'message-square', route: 'DConsultations'},
  {label: 'Earnings', icon: 'dollar-sign', route: 'DEarnings'},
  {label: 'Withdraw', icon: 'credit-card', route: 'DWithdraw'},
  {label: 'Profile', icon: 'user', route: 'DProfile'},
];

// Carried over verbatim from the AdminMenuModal this component replaced.
const ADMIN_MENU: RoleMenuItem[] = [
  {label: 'Dashboard', icon: 'home', route: 'AHome'},
  {label: 'Orders', icon: 'file-text', route: 'AOrders'},
  {label: 'Vendors', icon: 'users', route: 'AVendors'},
  {label: 'Medicine', icon: 'activity', route: 'AMedicines'},
  {label: 'Payments', icon: 'credit-card', route: 'APayments'},
  {label: 'Reports', icon: 'pie-chart', route: 'AReports'},
  {label: 'Users', icon: 'user', route: 'AUsers'},
  {label: 'Doctors', icon: 'user-plus', route: 'AUsers', userFilter: 'Doctors'},
  {
    label: 'Specialties',
    icon: 'layers',
    route: 'AUsers',
    userFilter: 'Specialties',
  },
  {label: 'Inventory', icon: 'archive', route: 'AInventory'},
  {label: 'Profile', icon: 'settings', route: 'AProfile'},
];

const MENUS: Record<AppRole, RoleMenuItem[]> = {
  CUSTOMER: CUSTOMER_MENU,
  VENDOR: VENDOR_MENU,
  DOCTOR: DOCTOR_MENU,
  ADMIN: ADMIN_MENU,
};

export const ROLE_MENU_TITLES: Record<AppRole, string> = {
  CUSTOMER: 'Menu',
  VENDOR: 'Vendor Menu',
  DOCTOR: 'Doctor Menu',
  ADMIN: 'Admin Menu',
};

export function getMenuForRole(role: AppRole): RoleMenuItem[] {
  return MENUS[role];
}

/** Narrows an arbitrary stored role string onto the four the app supports. */
export function normalizeRole(role: string | undefined | null): AppRole {
  switch (role?.toUpperCase()) {
    case 'VENDOR':
      return 'VENDOR';
    case 'ADMIN':
      return 'ADMIN';
    case 'DOCTOR':
      return 'DOCTOR';
    default:
      return 'CUSTOMER';
  }
}
