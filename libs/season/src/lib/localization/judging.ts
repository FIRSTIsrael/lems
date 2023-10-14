import { JudgingCategory, Awards } from '@lems/types';

export const localizedJudgingCategory: {
  [key in JudgingCategory]: { name: string };
} = {
  'innovation-project': { name: 'פרויקט החדשנות' },
  'robot-design': { name: 'תכנון הרובוט' },
  'core-values': { name: 'ערכי ליבה' }
};

export const localizedAward: {
  [key in Awards]: { name: string };
} = {
  coreValues: { name: 'ערכי הליבה' },
  innovationProject: { name: 'פרויקט החדשנות' },
  leadMentor: { name: 'המנטור המצטיין' },
  robotDesign: { name: 'תכנון הרובוט' },
  breakthrough: { name: 'פורצי הדרך' },
  robotPerformance: { name: 'ביצועי הרובוט' },
  volunteerOfTheYear: { name: 'מתנדב/ת השנה' },
  champions: { name: 'האליפות' },
  impact: { name: 'ההשפעה' },
  motivate: { name: 'המניעים' },
  risingAllStar: { name: 'הכוכה העולה' }
};
