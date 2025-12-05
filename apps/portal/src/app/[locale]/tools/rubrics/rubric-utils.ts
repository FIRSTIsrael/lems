import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { RubricFormValues } from './rubric-types';

export const getEmptyRubric = (category: JudgingCategory): RubricFormValues => {
  const fields: { [fieldId: string]: { value: null; notes?: string } } = {};
  const schema = rubrics[category];

  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      fields[field.id] = { value: null };
    });
  });

  const result: RubricFormValues = { fields };

  if (schema.feedback) {
    result.feedback = {
      greatJob: '',
      thinkAbout: ''
    };
  }

  return result;
};
