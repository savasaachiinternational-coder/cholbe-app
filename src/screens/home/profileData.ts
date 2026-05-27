export type ProfileSubTabKey =
  | 'overview'
  | 'nextDelivery'
  | 'addFamilyMember'
  | 'editProfile';

export const PROFILE_SUB_TABS: {
  key: ProfileSubTabKey;
  label: string;
  route?: 'Deliveries' | 'AddFamilyMember' | 'EditProfile';
}[] = [
  {key: 'overview', label: 'Overview'},
  {key: 'nextDelivery', label: 'Next Delivery', route: 'Deliveries'},
  {key: 'addFamilyMember', label: 'Add Family Member', route: 'AddFamilyMember'},
  {key: 'editProfile', label: 'Edit Profile', route: 'EditProfile'},
];

export const PROFILE_USER = {
  name: 'Habibur Rahman',
  demographics: 'Age : 32  •  Male  •  Blood Group: O-',
  location: 'Dhanmondi,Dhaka,Bangladesh',
  phone: '+880 1677589448',
  email: 'habib.hc.bd@gmail.com',
};

export const MEDICAL_CONDITIONS = ['Hypertension', 'Diabetes', 'Arthritis'];

export const ASSIGNED_DOCTOR = {
  name: 'Dr. Ahmed',
  specialty: 'Cardiologist',
};

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar: number;
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: '1',
    name: 'Mehidi',
    relation: 'Brother',
    phone: '01677589448',
    avatar: require('../../assets/b2.png'),
  },
  {
    id: '2',
    name: 'Rohima',
    relation: 'Sister',
    phone: '01677589448',
    avatar: require('../../assets/b1.png'),
  },
];

export type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  avatar: number;
};

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: '1',
    name: 'Mehidi Hasan',
    relation: 'Son',
    avatar: require('../../assets/b2.png'),
  },
  {
    id: '2',
    name: 'Rohima Akter',
    relation: 'Daughter',
    avatar: require('../../assets/b1.png'),
  },
  {
    id: '3',
    name: 'Dr. Ahmed',
    relation: 'Cardiologist',
    avatar: require('../../assets/b2.png'),
  },
];

export type HealthSummaryItem = {
  id: string;
  label: string;
  value: string;
  sub: string;
};

export const HEALTH_SUMMARY: HealthSummaryItem[] = [
  {
    id: '1',
    label: 'Last checkup',
    value: '15 Mar, 2026',
    sub: 'Evercare Hospital Dhaka',
  },
  {
    id: '2',
    label: 'Latest Report',
    value: 'Blood Test',
    sub: '15 Mar, 2026',
  },
  {
    id: '3',
    label: 'Next Appointment',
    value: '15 Mar, 2026',
    sub: '10:30 AM',
  },
  {
    id: '4',
    label: 'Last checkup',
    value: '15 Mar, 2026',
    sub: 'Evercare Hospital Dhaka',
  },
];

export type QuickAction = {
  id: string;
  title: string;
  subtitle: string;
  icon: 'medications' | 'upload' | 'passport' | 'emergency';
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'medications',
    title: 'My Medications',
    subtitle: 'View, Track & Refill',
    icon: 'medications',
  },
  {
    id: 'upload',
    title: 'Upload Reports',
    subtitle: 'Lab Tests, Prescriptions',
    icon: 'upload',
  },
  {
    id: 'passport',
    title: 'Health Passport',
    subtitle: 'View, Track & Refill',
    icon: 'passport',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    subtitle: 'Lab Tests, Prescriptions',
    icon: 'emergency',
  },
];
