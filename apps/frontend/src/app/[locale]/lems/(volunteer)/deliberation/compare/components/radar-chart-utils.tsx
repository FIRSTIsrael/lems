import { rubrics } from '@lems/shared/rubrics';
import type { Team } from '../graphql/types';

export interface RadarChartDataPoint {
  field: string;
  score: number;
}

export interface CategoryDataPoint {
  category: string;
  score: number;
}

export const calculateAverage = (values: number[]) =>
  values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;

export const extractCoreValuesBySection = (rubric: any, schema: any): Record<string, number[]> => {
  const result: Record<string, number[]> = {};
  if (!rubric?.data?.fields) return result;

  schema.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.coreValues && rubric.data.fields[field.id]?.value !== null) {
        if (!result[section.id]) result[section.id] = [];
        result[section.id].push(rubric.data.fields[field.id].value || 0);
      }
    });
  });
  return result;
};

export const extractCoreValuesFields = (rubric: any, schema: any): number[] => {
  const values: number[] = [];
  if (!rubric?.data?.fields) return values;

  schema.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.coreValues && rubric.data.fields[field.id]?.value !== null) {
        values.push(rubric.data.fields[field.id].value);
      }
    });
  });
  return values;
};

export const calculateRubricAverage = (rubric: any) => {
  if (!rubric?.data?.fields) return 0;
  const values = Object.values(rubric.data.fields)
    .filter((field: any) => field.value !== null)
    .map((field: any) => field.value || 0);
  return calculateAverage(values);
};

export const getCategoryRadarColor = (category: string): string => {
  const colors = {
    innovation_project: '#64B5F6',
    robot_design: '#81C784',
    core_values: '#E57373'
  };
  return colors[category.replace('-', '_') as keyof typeof colors] || '#64B5F6';
};

export const processCoreValuesRadarData = (
  team: Team,
  getSectionTitle: (sectionId: string) => string
): RadarChartDataPoint[] => {
  const ipRubric = team.rubrics.innovation_project;
  const rdRubric = team.rubrics.robot_design;
  if (!ipRubric?.data?.fields && !rdRubric?.data?.fields) return [];

  const ipSchema = rubrics['innovation-project'];
  const ipSectionScores = extractCoreValuesBySection(ipRubric, ipSchema);
  const rdSectionScores = extractCoreValuesBySection(rdRubric, rubrics['robot-design']);

  return ipSchema.sections.map(section => ({
    field: getSectionTitle(section.id),
    score: calculateAverage([
      ...(ipSectionScores[section.id] || []),
      ...(rdSectionScores[section.id] || [])
    ])
  }));
};

export const processRubricRadarData = (
  rubric: any,
  category: string,
  getSectionTitle: (sectionId: string) => string
): RadarChartDataPoint[] => {
  if (!rubric?.data?.fields) return [];
  const schema = rubrics[category as keyof typeof rubrics];
  if (!schema || typeof schema === 'string' || !schema.sections) return [];

  return schema.sections.map(section => ({
    field: getSectionTitle(section.id),
    score: calculateAverage(
      section.fields
        .map((field: any) => rubric.data.fields[field.id]?.value)
        .filter((v: any) => v !== null && v !== undefined)
    )
  }));
};

export const processAllCategoriesRadarData = (
  team: Team,
  getCategory: (key: string) => string
): CategoryDataPoint[] => {
  const categories = [
    { key: 'innovation-project', rubric: team.rubrics.innovation_project },
    { key: 'robot-design', rubric: team.rubrics.robot_design }
  ];

  return [
    ...categories.map(({ key, rubric }) => ({
      category: getCategory(key),
      score: calculateRubricAverage(rubric)
    })),
    {
      category: getCategory('core-values'),
      score: calculateAverage(
        categories.flatMap(({ key, rubric }) =>
          extractCoreValuesFields(rubric, rubrics[key as keyof typeof rubrics])
        )
      )
    }
  ];
};
