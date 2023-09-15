import { JudgingCategory } from '@lems/types';

export const localizedJudgingCategory: {
  [key in JudgingCategory]: { name: string };
} = {
  'innovation-project': { name: 'פרויקט החדשנות' },
  'robot-design': { name: 'תכנון הרובוט' },
  'core-values': { name: 'ערכי ליבה' }
};
