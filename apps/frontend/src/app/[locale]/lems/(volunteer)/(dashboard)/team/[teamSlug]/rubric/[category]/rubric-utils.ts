import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { Rubric } from '@lems/database';
import type { RubricFieldValue } from './types';

export const getEmptyRubric = (category: JudgingCategory): Rubric['data'] => {
  const schema = rubrics[category];

  const awards: { [awardId: string]: boolean } = {};

  const fields: { [fieldId: string]: RubricFieldValue } = {};
  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      fields[field.id] = { value: null };
    });
  });

  const feedback = {
    greatJob: '',
    thinkAbout: ''
  };

  return { ...(schema.awards ? { awards } : {}), fields, ...(schema.feedback && { feedback }) };
};
