import {ImageSourcePropType} from 'react-native';

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  image?: ImageSourcePropType;
  /** Used to size the illustration area */
  imageWidth?: number;
  imageHeight?: number;
  showHeader?: boolean;
  showSignIn?: boolean;
  showFloatingCard?: boolean;
  floatingCardText?: string;
};

export const ONBOARDING_GRADIENT = ['#F5F8FC', '#EFF4FA', '#E8EFF7'] as const;

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'healthcare',
    title: 'All Your\nHealthcare Needs,\nIn One App',
    description:
      'No more app-hopping. Book doctors, check symptoms, get prescriptions—instantly.',
    image: require('../../assets/b1.png'),
    imageWidth: 343,
    imageHeight: 229,
  },
  {
    id: 'appointment',
    title: 'Appointment for\nThe Doctor',
    description:
      'No more app-hopping. Book doctors, check symptoms, get prescriptions—instantly.',
    image: require('../../assets/b2.png'),
    imageWidth: 332,
    imageHeight: 378,
    showHeader: true,
    showSignIn: true,
  },
  {
    id: 'epharmacy',
    title: 'E-Pharmacy &\nMedicine Delivery',
    description:
      'No more app-hopping. Book doctors, check symptoms, get prescriptions—instantly.',
    image: require('../../assets/b3.png'),
    imageWidth: 343,
    imageHeight: 286,
    showHeader: true,
    showSignIn: true,
    showFloatingCard: true,
    floatingCardText: '⚡ Express Delivery',
  },
  {
    id: 'ai-doctor',
    title: 'AI Health Assistant\n& 24/7 Digital Doctor',
    description:
      'From reminders to records everything to keep you healthy and worry-free.',
    image: require('../../assets/b4.png'),
    imageWidth: 343,
    imageHeight: 286,
    showHeader: true,
    showSignIn: true,
  },
];
