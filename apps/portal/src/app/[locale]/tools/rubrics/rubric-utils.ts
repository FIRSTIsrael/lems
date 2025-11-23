import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types';
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
      'great-job': '',
      'think-about': ''
    };
  }

  return result;
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
