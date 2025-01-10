import { RubricStatus, CoreValuesAwards } from '@lems/types';

export const localizedRubricStatus: { [key in RubricStatus]: string } = {
  empty: 'לא מולא',
  'in-progress': 'בתהליך',
  completed: 'מלא',
  'waiting-for-review': 'נעול',
  ready: 'אושר סופית'
};

export const localizedOptionalAward: {
  [key in CoreValuesAwards]: { name: string; description: string };
} = {
  impact: {
    name: 'ההשפעה',
    description:
      'קבוצה שבצעה פעילות משמעותית לטובת הקהילה והדגימה כיצד השתתפותה ב- _FIRST®_ LEGO® League השפיעה על כל אחד ואחת מחברי הקבוצה.'
  },
  breakthrough: {
    name: 'פורצי הדרך',
    description:
      'קבוצה שחבריה עשו התקדמות משמעותית ביכולותיהם ובביטחון העצמי שלהם והבינו שמה שהם מגלים חשוב יותר מהפרסים.'
  },
  'rising-all-star': {
    name: 'הכוכב העולה',
    description: 'קבוצה אשר תפסה את תשומת לב השופטים והם צופים לה הישגים גדולים בעתיד.'
  },
  motivate: {
    name: 'המניעים',
    description:
      'קבוצה שמטמיעה את התרבות של _FIRST®_ LEGO® League על ידי גיבוש  קבוצתי, רוח צוות והתלהבות.'
  }
};
