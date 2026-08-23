import type {ImageSourcePropType} from 'react-native';

export const IDEATION_NEXT_HEADING = "Here's what you can do next";

export const TELEMEDICINE_PROMO = {
  badge: 'Get 10% off',
  caption: 'Your first telemedicine visit >',
  // Placeholder art until the banner illustration is exported.
  image: require('../../../../assets/b3.png') as ImageSourcePropType,
};

export const SELF_CARE_TIPS = {
  title: 'Self-Care Tips',
  bullets: [
    'Try resting in a dark, quiet room.',
    'Stay hydrated and avoid screen time.',
  ],
};

export const OTC_SUGGESTIONS = {
  title: 'OTC Suggestions',
  body: 'Consider taking ibuprofen. Always follow label instructions',
};

export const BOOK_DOCTOR_LABEL = 'Book a Doctor';
export const NEARBY_LABS_LABEL = 'View Nearby Labs for Schedule';
