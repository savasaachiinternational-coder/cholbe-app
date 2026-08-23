import type {ImageSourcePropType} from 'react-native';

export type AiHelpCategory = {
  title: string;
  image: ImageSourcePropType;
};

export const AI_HELP_CATEGORIES: AiHelpCategory[] = [
  {title: 'Fever', image: require('../../../../assets/Fever.png')},
  {title: 'Fatigue', image: require('../../../../assets/Fatigue.png')},
  {
    title: 'Shortness of Breath',
    image: require('../../../../assets/Shortness of Breath.png'),
  },
  {title: 'Skin Rash', image: require('../../../../assets/Skin Rash.png')},
  {title: 'Nausea', image: require('../../../../assets/Nausea.png')},
  {title: 'Body Ache', image: require('../../../../assets/Skin Rash-1.png')},
];
