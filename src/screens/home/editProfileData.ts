export const EDIT_PROFILE_FORM = {
  name: 'Habibur Rahman',
  age: '32',
  gender: 'Male',
  bloodGroup: 'O-',
  address: 'Dhanmondi,Dhaka,Bangladesh',
  phone: '+880 1677589448',
  email: 'habib.hc.bd@gmail.com',
};

export type EditEmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatar: number;
};

export const EDIT_EMERGENCY_CONTACTS: EditEmergencyContact[] = [
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
