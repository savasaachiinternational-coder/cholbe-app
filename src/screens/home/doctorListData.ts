import type {ComponentProps} from 'react';
import type Feather from 'react-native-vector-icons/Feather';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export type DoctorCategory = {
  id: string;
  name: string;
  icon: FeatherIconName;
};

export type DoctorListItem = {
  id: string;
  name: string;
  specialty: string;
  degree: string;
  fee: string;
  image: number;
};

export const DOCTOR_CATEGORIES: DoctorCategory[] = [
  {id: '1', name: 'Physician', icon: 'activity'},
  {id: '2', name: 'Pediatric', icon: 'users'},
  {id: '3', name: 'Gynae & obs', icon: 'heart'},
  {id: '4', name: 'Dermatology', icon: 'sun'},
  {id: '5', name: 'Endocrinology', icon: 'layers'},
  {id: '6', name: 'More', icon: 'plus-square'},
];

const DOCTOR_IMAGE = require('../../assets/b2.png');

export const DOCTOR_LIST_ITEMS: DoctorListItem[] = [
  {
    id: '1',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
  {
    id: '2',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
  {
    id: '3',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
  {
    id: '4',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
  {
    id: '5',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
  {
    id: '6',
    name: 'Dr. Alex Same',
    specialty: 'Dermatologist',
    degree: 'MBBS, (Dermatology), DCH – Dermatologist',
    fee: '৳ 1000',
    image: DOCTOR_IMAGE,
  },
];
