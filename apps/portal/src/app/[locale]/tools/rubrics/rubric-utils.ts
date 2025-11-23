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

export const categoryColors: Record<JudgingCategory, { light: string; dark: string }> = {
  'innovation-project': {
    light: '#C7EAFB',
    dark: '#1976d2'
  },
  'robot-design': {
    light: '#CCE7D3',
    dark: '#388e3c'
  },
  'core-values': {
    light: '#FCD3C1',
    dark: '#d32f2f'
  }
};

export const getCategoryColor = (
  category: JudgingCategory,
  variant: 'light' | 'dark' = 'light'
) => {
  return categoryColors[category][variant];
};
