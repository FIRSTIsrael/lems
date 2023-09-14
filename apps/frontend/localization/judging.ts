import { JudgingCategory, OptionalAwards } from '@lems/types';

export const localizedJudgingCategory: {
  [key in JudgingCategory]: { name: string };
} = {
  'innovation-project': { name: 'פרויקט החדשנות' },
  'robot-design': { name: 'תכנון הרובוט' },
  'core-values': { name: 'ערכי ליבה' }
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
