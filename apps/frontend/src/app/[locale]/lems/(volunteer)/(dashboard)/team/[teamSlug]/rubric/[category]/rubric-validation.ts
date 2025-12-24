import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { RubricItem } from './graphql';

export type ValidationError =
  | 'missing-field-value'
  | 'missing-notes-for-level-4'
  | 'missing-feedback';

export interface ValidationResult {
  isValid: boolean;
  error?: ValidationError;
  invalidFieldId?: string;
}

export function validateRubric(rubric: RubricItem, category: JudgingCategory): ValidationResult {
  const schema = rubrics[category];
  const data = rubric.data;

  if (!data) {
    return { isValid: false, error: 'missing-field-value' };
  }

  // Check all fields have non-null values
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const fieldValue = data.fields?.[field.id];
      if (fieldValue?.value === null || fieldValue?.value === undefined) {
        return { isValid: false, error: 'missing-field-value', invalidFieldId: field.id };
      }
    }
  }

  // Check fields with value 4 have notes
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const fieldValue = data.fields?.[field.id];
      if (fieldValue?.value === 4 && (!fieldValue.notes || fieldValue.notes.trim() === '')) {
        return {
          isValid: false,
          error: 'missing-notes-for-level-4',
          invalidFieldId: field.id
        };
      }
    }
  }

  // Check feedback fields are filled
  if (!data.feedback?.greatJob?.trim() || !data.feedback?.thinkAbout?.trim()) {
    return { isValid: false, error: 'missing-feedback', invalidFieldId: 'feedback' };
  }

  return { isValid: true };
}

export function getValidationErrorMessage(
  error: ValidationError,
  t: (key: string) => string
): string {
  const messages: Record<ValidationError, string> = {
    'missing-field-value': t('validation.missing-field-value'),
    'missing-notes-for-level-4': t('validation.missing-notes-for-level-4'),
    'missing-feedback': t('validation.missing-feedback')
  };
  return messages[error];
}
