import { getRubrics } from '@lems/shared/rubrics';
import type { Edition } from '@lems/shared/edition';
import { JudgingCategory } from '@lems/types/judging';
import { Rubric } from '@lems/database';
import type { RubricFieldValue } from './graphql';

export const getEmptyRubric = (edition: Edition, category: JudgingCategory): Rubric['data'] => {
  const schema = getRubrics(edition)[category];

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

  return { awards, fields, feedback };
};
