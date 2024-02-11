import { AudienceDisplayScreen, RobotGameMatchPresent, RobotGameMatchStatus } from '@lems/types';

export const localizedMatchStage = {
  practice: 'אימונים',
  ranking: 'דירוג',
  test: 'בדיקה'
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

export const localizedAudienceDisplayScreen: Record<AudienceDisplayScreen, string> = {
  blank: 'מסך ריק',
  logo: 'לוגו',
  scores: 'מסך הניקוד',
  awards: 'מצגת פרסים',
  sponsors: 'שותפים',
  hotspot: 'תזכורת נקודות גישה',
  'match-preview': 'תצוגת מקצה',
  message: 'הודעה'
};
