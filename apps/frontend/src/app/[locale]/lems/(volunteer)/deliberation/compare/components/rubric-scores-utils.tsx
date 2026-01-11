import { rubrics } from '@lems/shared/rubrics';
import type { RubricCategorySchema } from '@lems/shared/rubrics';
import type { Team, Rubric, RubricFieldValue } from '../graphql/types';
import type { FieldComparison } from '../compare-context';

export interface RubricField {
  fieldId: string;
  category: string;
  value: number | null;
  color: 'success' | 'error' | 'default';
}

export type FieldComparisons = Map<string, FieldComparison>;

export function getFieldComparisonColor(
  fieldId: string,
  teamId: string,
  fieldComparisons: FieldComparisons,
  prefix?: string
): 'success' | 'error' | 'default' {
  const comparisonKey = prefix ? `${prefix}-${fieldId}` : fieldId;
  const comparison = fieldComparisons.get(comparisonKey);

  if (!comparison) return 'default';

  const teamValue = comparison.values.get(teamId);
  if (teamValue === undefined || comparison.max <= comparison.min) {
    return 'default';
  }

  const values = Array.from(comparison.values.values());
  const teamsWithMax = values.filter(v => v === comparison.max).length;
  const teamsWithMin = values.filter(v => v === comparison.min).length;

  if (teamValue === comparison.max && comparison.max > comparison.min && teamsWithMax === 1) {
    return 'success';
  }
  if (teamValue === comparison.min && comparison.max > comparison.min && teamsWithMin === 1) {
    return 'error';
  }
  return 'default';
}

export const extractCoreValuesFields = (
  rubric: Rubric | null | undefined,
  schema: RubricCategorySchema,
  categoryPrefix: string,
  teamId: string,
  fieldComparisons: FieldComparisons
): RubricField[] => {
  if (!rubric?.data?.fields) return [];

  const fields = rubric.data.fields;
  const result: RubricField[] = [];

  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.coreValues && fields[field.id]) {
        result.push({
          fieldId: field.id,
          category: categoryPrefix === 'ip' ? 'innovation-project' : 'robot-design',
          value: fields[field.id].value,
          color: getFieldComparisonColor(field.id, teamId, fieldComparisons, categoryPrefix)
        });
      }
    });
  });

  return result;
};

export const extractRubricFields = (
  rubric: Rubric | null | undefined,
  category: string,
  teamId: string,
  fieldComparisons: FieldComparisons
): RubricField[] => {
  if (!rubric?.data?.fields) return [];

  return Object.entries(rubric.data.fields).map(([fieldId, field]: [string, RubricFieldValue]) => ({
    fieldId,
    category,
    value: field.value,
    color: getFieldComparisonColor(fieldId, teamId, fieldComparisons)
  }));
};

const categoryColors = {
  'innovation-project': { main: '#2196f3', bg: '#e3f2fd' },
  'robot-design': { main: '#4caf50', bg: '#e8f5e8' },
  'core-values': { main: '#f44336', bg: '#ffebee' }
} as const;

export const getCategoryColor = (category: string) =>
  categoryColors[category as keyof typeof categoryColors]?.main ||
  categoryColors['innovation-project'].main;

export const getCategoryBgColor = (category: string) =>
  categoryColors[category as keyof typeof categoryColors]?.bg ||
  categoryColors['innovation-project'].bg;

export const processFieldsByCategory = (
  team: Team,
  fieldComparisons: FieldComparisons,
  category?: string
): Record<string, RubricField[]> => {
  const categories = category ? [category] : ['innovation-project', 'robot-design', 'core-values'];

  return categories.reduce(
    (result, cat) => {
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
      return result;
    },
    {} as Record<string, RubricField[]>
  );
};
