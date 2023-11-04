import { AudienceDisplayState, RobotGameMatchPresent, RobotGameMatchStatus } from '@lems/types';

export const localizedMatchStage = {
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

export const localizedAudienceDisplayState: Record<AudienceDisplayState, string> = {
  blank: 'מסך ריק',
  scores: 'מסך הניקוד',
  awards: 'מצגת פרסים',
  sponsors: 'שותפים',
  logo: 'לוגו',
  hotspot: 'תזכורת נקודות גישה',
  'match-preview': 'תצוגת מקצה'
};
