import type {ImageSourcePropType} from 'react-native';

export type PainLocation = {
  id: string;
  label: string;
  image?: ImageSourcePropType;
};

export const PAIN_LOCATIONS: PainLocation[] = [
  {
    id: 'upper-leg',
    label: 'Upper Leg',
    image: require('../../../../assets/pain_indicator.png'),
  },
  {id: 'lower-leg', label: 'Lower Leg'},
  {id: 'bone', label: 'Bone'},
  {id: 'heart', label: 'Heart'},
  {id: 'chest', label: 'Chest'},
];

export const PAIN_LOCATION_QUESTION =
  'Where exactly is the pain or issue located?';

export const DEFAULT_BODY_DIAGRAM: ImageSourcePropType = require('../../../../assets/pain_indicator.png');
