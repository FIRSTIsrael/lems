import { blue, green, red } from '@mui/material/colors';
import { rubrics } from '@lems/shared/rubrics';
import type { Team } from '../graphql/types';

export interface RubricField {
  fieldId: string;
  category: string;
  value: number | null;
  color: 'success' | 'error' | 'warning' | 'default';
}

export type FieldComparisons = Map<
  string,
  {
    values: Map<string, number>;
    max: number;
    min: number;
  }
>;

export function getFieldComparisonColor(
  fieldId: string,
  teamId: string,
  fieldComparisons: FieldComparisons,
  prefix?: string
): 'success' | 'error' | 'warning' | 'default' {
  const comparisonKey = prefix ? `${prefix}-${fieldId}` : fieldId;
  const comparison = fieldComparisons.get(comparisonKey);

  if (!comparison) return 'default';

  const teamValue = comparison.values.get(teamId);
  if (teamValue === undefined || comparison.max <= comparison.min) {
    return 'default';
  }

  if (teamValue === comparison.max) return 'success';
  if (teamValue === comparison.min) return 'error';
  return 'warning';
}

export function extractCoreValuesFields(
  rubric: any,
  schema: any,
  categoryPrefix: string,
  teamId: string,
  fieldComparisons: FieldComparisons
): RubricField[] {
  if (!rubric?.data?.fields) return [];

  const fields = rubric.data.fields as Record<string, { value: number | null; notes?: string }>;
  const result: RubricField[] = [];

  schema.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.coreValues && fields[field.id]) {
        const color = getFieldComparisonColor(field.id, teamId, fieldComparisons, categoryPrefix);
        result.push({
          fieldId: field.id,
          category: categoryPrefix === 'ip' ? 'innovation-project' : 'robot-design',
          value: fields[field.id].value,
          color
        });
      }
    });
  });

  return result;
}

export function extractRubricFields(
  rubric: any,
  category: string,
  teamId: string,
  fieldComparisons: FieldComparisons
): RubricField[] {
  if (!rubric?.data?.fields) return [];

  const result: RubricField[] = [];

  Object.entries(rubric.data.fields).forEach(([fieldId, field]: [string, any]) => {
    const color = getFieldComparisonColor(fieldId, teamId, fieldComparisons);
    result.push({
      fieldId,
      category,
      value: field.value,
      color
    });
  });

  return result;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'innovation-project':
      return blue[500];
    case 'robot-design':
      return green[500];
    case 'core-values':
      return red[500];
    default:
      return blue[500];
  }
}

export function getCategoryBgColor(category: string): string {
  switch (category) {
    case 'innovation-project':
      return blue[50];
    case 'robot-design':
      return green[50];
    case 'core-values':
      return red[50];
    default:
      return blue[50];
  }
}

export function processFieldsByCategory(
  team: Team,
  fieldComparisons: FieldComparisons,
  category?: string
): Record<string, RubricField[]> {
  const categories = category ? [category] : ['innovation-project', 'robot-design', 'core-values'];
  const result: Record<string, RubricField[]> = {};

  categories.forEach(cat => {
    if (cat === 'core-values') {
      const ipFields = extractCoreValuesFields(
        team.rubrics.innovation_project,
        rubrics['innovation-project'],
        'ip',
        team.id,
        fieldComparisons
      );
      const rdFields = extractCoreValuesFields(
        team.rubrics.robot_design,
        rubrics['robot-design'],
        'rd',
        team.id,
        fieldComparisons
      );
      result[cat] = [...ipFields, ...rdFields];
    } else {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      result[cat] = extractRubricFields(team.rubrics[rubricKey], cat, team.id, fieldComparisons);
    }
  });

  return result;
}
