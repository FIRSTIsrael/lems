import { Rubric } from '@lems/database';
import { rubrics } from '../rubrics/rubrics';

/**
 * Infers Core Values rubric field data from Innovation Project and Robot Design rubrics.
 *
 * Core Values rubric fields are flagged with `coreValues: true` in the IP and RD schemas.
 * This function extracts those fields from both rubrics and merges them into a single
 * Core Values data object with prefixed field IDs ('ip-' and 'rd-').
 *
 * @param innovationProjectData - The Innovation Project rubric data
 * @param robotDesignData - The Robot Design rubric data
 * @returns Core Values rubric fields with inferred fields
 *
 * @example
 * ```ts
 * const cvData = inferCoreValuesFields(ipRubric.data, rdRubric.data);
 * // Returns: { 'ip-research': { value: 3 }, 'rd-resources': { value: 4 }, ... }
 * ```
 */
export function inferCoreValuesFields(
  innovationProjectData?: Rubric['data'],
  robotDesignData?: Rubric['data']
): Record<string, { value: 1 | 2 | 3 | 4 | null; notes?: string }> {
  const cvFields: Record<string, { value: 1 | 2 | 3 | 4 | null; notes?: string }> = {};

  // Extract CV-flagged fields from Innovation Project rubric
  const ipSchema = rubrics['innovation-project'];
  for (const section of ipSchema.sections) {
    for (const field of section.fields) {
      if (field.coreValues) {
        const fieldValue = innovationProjectData?.fields?.[field.id] ?? null;
        if (fieldValue) {
          cvFields[`ip-${field.id}`] = fieldValue;
        }
      }
    }
  }

  // Extract CV-flagged fields from Robot Design rubric
  const rdSchema = rubrics['robot-design'];
  for (const section of rdSchema.sections) {
    for (const field of section.fields) {
      if (field.coreValues) {
        const fieldValue = robotDesignData?.fields?.[field.id] ?? null;
        if (fieldValue) {
          cvFields[`rd-${field.id}`] = fieldValue;
        }
      }
    }
  }

  return cvFields;
}

/**
 * Gets the list of Core Values field IDs from Innovation Project and Robot Design schemas.
 *
 * @returns Object mapping category names to arrays of CV-flagged field IDs
 */
export function getCvFieldIds(): {
  'innovation-project': string[];
  'robot-design': string[];
} {
  const ipFields = rubrics['innovation-project'].sections
    .flatMap(section => section.fields)
    .filter(field => field.coreValues)
    .map(field => field.id);

  const rdFields = rubrics['robot-design'].sections
    .flatMap(section => section.fields)
    .filter(field => field.coreValues)
    .map(field => field.id);

  return {
    'innovation-project': ipFields,
    'robot-design': rdFields
  };
}
