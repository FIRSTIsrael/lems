import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import type { RubricFieldValue, RubricFeedback } from './types';
import type { RubricItem } from './rubric.graphql';

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

/**
 * Creates an empty rubric item when the query returns data but no rubric exists
 * This happens when a rubric hasn't been started yet
 */
export const createEmptyRubricItem = (
  category: JudgingCategory,
  team: { id: string; name: string; number: number },
  schema: (typeof rubrics)[JudgingCategory]
): RubricItem => {
  return {
    id: '', // Will be set by backend when saved
    team,
    category,
    status: 'empty',
    data: {
      awards: schema.awards ? {} : undefined,
      values: {},
      feedback: {
        greatJob: '',
        thinkAbout: ''
      }
    }
  };
};
