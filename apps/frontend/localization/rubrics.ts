import { RubricStatus, OptionalAwards, RubricFields } from '@lems/types';
import { RubricSchemaSection } from './rubric-schemas';

export const localizedRubricStatus: { [key in RubricStatus]: string } = {
  empty: 'לא מולא',
  'in-progress': 'בתהליך',
  completed: 'ממתין להגשה סופית',
  'waiting-for-review': 'ממתין לשופט ראשי',
  ready: 'אושר סופית'
};

export const localizedOptionalAward: {
  [key in OptionalAwards]: { name: string; description: string };
} = {
  breakthrough: {
    name: 'פורצי הדרך',
    description:
      'קבוצה שחבריה עשו התקדמות משמעותית ביכולותיהם ובביטחון העצמי שלהם והבינו שמה שהם מגלים חשוב יותר מהפרסים.'
  },
  risingAllStar: {
    name: 'הכוכב העולה',
    description: 'קבוצה אשר תפסה את תשומת לב השופטים והם צופים לה הישגים גדולים בעתיד.'
  },
  motivate: {
    name: 'המניעים',
    description:
      'קבוצה שמטמיעה את התרבות של _FIRST®_ LEGO® League על ידי גיבוש  קבוצתי, רוח צוות והתלהבות.'
  }
};
