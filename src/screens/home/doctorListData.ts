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

/** Artwork used by the image-based category tiles on DoctorListScreen. */
export const CATEGORY_MORE_IMAGE = require('../../assets/doctor_more.png');

const CATEGORY_IMAGES: Record<string, number> = {
  physician: require('../../assets/General Physician.png'),
  generalphysician: require('../../assets/General Physician.png'),
  pediatric: require('../../assets/Pediatric.png'),
  pediatrics: require('../../assets/Pediatric.png'),
  gynaeobs: require('../../assets/Gynae & Obs.png'),
  gynaecology: require('../../assets/Gynae & Obs.png'),
  dermatology: require('../../assets/Dermatolgist.png'),
  dermatologist: require('../../assets/Dermatolgist.png'),
  endocrinology: require('../../assets/Endocrinology.png'),
  endocrinologist: require('../../assets/Endocrinology.png'),
};

/**
 * Resolves a specialty name to its tile artwork. Names arrive either from the
 * specialties API or from DOCTOR_CATEGORIES, so match on a loose key that
 * ignores case, spaces and punctuation. Returns null when there is no artwork.
 */
export function getCategoryImage(name: string): number | null {
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  return CATEGORY_IMAGES[key] ?? null;
}

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
