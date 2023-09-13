import { RubricStatus } from '@lems/types';

export const localizedRubricStatus: { [key in RubricStatus]: string } = {
  empty: 'לא מולא',
  'in-progress': 'בתהליך',
  completed: 'ממתין להגשה סופית',
  'waiting-for-review': 'ממתין לשופט ראשי',
  ready: 'אושר סופית'
};
