import { RobotGameMatchPresent } from '@lems/types';

export const localizedMatchType = {
  practice: 'מקצה אימונים',
  ranking: 'מקצה רשמי'
};

export const localizedMatchPresent: Record<RobotGameMatchPresent, string> = {
  present: 'נוכחת',
  'no-show': 'לא נוכחת'
};
