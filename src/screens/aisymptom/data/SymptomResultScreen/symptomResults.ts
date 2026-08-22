import type {ImageSourcePropType} from 'react-native';

export type ConditionSuggestion = {
  id: string;
  name: string;
  /** 0–100. Drives both the bar width and its colour. */
  confidence: number;
  description?: string;
  /** Spells out "confidence" after the percentage instead of just "%". */
  labelConfidence?: boolean;
  severity: string;
  triggers: string;
  /** Name of the specialty that treats this — matches a backend Specialty. */
  specialty?: string;
};

export type SuggestedDoctor = {
  id: string;
  name: string;
  specialty: string;
  degree: string;
  fee: string;
  rating?: number;
  reviewCount?: number;
  image?: ImageSourcePropType;
};

export const RESULT_HEADING = "Here's what I think it might be";

export const RESULT_SUBHEADING =
  'Based on your answers, here are the most likely explanations.';

export const RESULT_CTA_LABEL = 'See what to do next';

export const SUGGESTED_DOCTORS_HEADING = 'Suggested doctors';

// Placeholder results until the backend scores the intake.
export const CONDITION_SUGGESTIONS: ConditionSuggestion[] = [
  {
    id: 'migraine',
    name: 'Migraine',
    confidence: 80,
    labelConfidence: true,
    description:
      'A migraine is a recurring headache that causes moderate to severe pain, often with nausea or sensitivity to light and sound.',
    severity: 'Moderate',
    triggers: 'Stress, lack of sleep',
  },
  {
    id: 'tension-headache',
    name: 'Tension Headache',
    confidence: 55,
    severity: 'Mild',
    triggers: 'Poor posture, eye strain',
  },
  {
    id: 'sinus-infection',
    name: 'Sinus Infection',
    confidence: 40,
    severity: 'Moderate',
    triggers: 'Allergies, cold',
  },
];

export const SUGGESTED_DOCTORS: SuggestedDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ayesha Rahman',
    specialty: 'Neurology',
    degree: 'MBBS, FCPS (Neurology)',
    fee: '৳800',
    rating: 4.8,
    reviewCount: 126,
  },
  {
    id: 'doc-2',
    name: 'Dr. Imran Hossain',
    specialty: 'Physician',
    degree: 'MBBS, MD (Internal Medicine)',
    fee: '৳600',
    rating: 4.6,
    reviewCount: 94,
  },
];
