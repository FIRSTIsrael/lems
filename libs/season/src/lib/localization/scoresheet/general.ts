import { ScoresheetStatus } from '@lems/types';

export const localizedScoresheetStatus: { [key in ScoresheetStatus]: string } = {
  empty: 'לא מולא',
  'in-progress': 'בתהליך',
  completed: 'ממתין להגשה סופית',
  'waiting-for-gp': 'ממתין לציון מקצועיות אדיבה',
  'waiting-for-head-ref': 'ממתין לשופט ראשי',
  ready: 'הוגש'
};
