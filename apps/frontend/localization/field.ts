import { RobotGameMatchPresent, RobotGameMatchStatus } from '@lems/types';

export const localizedMatchType = {
  practice: 'מקצה אימונים',
  ranking: 'מקצה רשמי',
  test: 'מקצה בדיקה'
};

export const localizedMatchPresent: Record<RobotGameMatchPresent, string> = {
  present: 'נוכחת',
  'no-show': 'לא נוכחת'
};

export const localizedMatchStatus: Record<RobotGameMatchStatus, string> = {
  'not-started': 'לא התחיל',
  'in-progress': 'מקצה רץ',
  completed: 'מקצה הושלם'
};
