import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import type { RubricFieldValue, RubricFeedback } from './types';

export interface RubricFormValues {
  fields: { [fieldId: string]: RubricFieldValue };
  feedback?: RubricFeedback;
}

export const getEmptyRubric = (category: JudgingCategory): RubricFormValues => {
  const fields: { [fieldId: string]: RubricFieldValue } = {};
  const schema = rubrics[category];

  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      fields[field.id] = { value: null };
    });
  });

  const feedback: RubricFeedback = {};
  if (schema.feedback) {
    feedback['great-job'] = '';
    feedback['think-about'] = '';
  }

  return { fields, ...(schema.feedback && { feedback }) };
};

export const getCategoryColor = (category: JudgingCategory) => {
  switch (category) {
    case 'core-values':
      return '#d32f2f';
    case 'innovation-project':
      return '#1976d2';
    case 'robot-design':
      return '#388e3c';
  }
};
