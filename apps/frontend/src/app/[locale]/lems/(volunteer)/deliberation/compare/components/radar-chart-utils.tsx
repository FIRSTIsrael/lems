import { blue, green, red } from '@mui/material/colors';
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

type RubricFields = Record<string, { value: number | null; notes?: string }>;

export function calculateAverage(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}

export function extractCoreValuesBySection(rubric: any, schema: any): Record<string, number[]> {
  const sectionScores: Record<string, number[]> = {};

  if (!rubric?.data?.fields) return sectionScores;

  const fields = rubric.data.fields as RubricFields;

  schema.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.coreValues && fields[field.id]?.value !== null) {
        if (!sectionScores[section.id]) sectionScores[section.id] = [];
        sectionScores[section.id].push(fields[field.id].value || 0);
      }
    });
  });

  return sectionScores;
}

export function extractCoreValuesFields(rubric: any, schema: any): number[] {
  const values: number[] = [];

  if (!rubric?.data?.fields) return values;

  const fields = rubric.data.fields as RubricFields;

  schema.sections.forEach((section: any) => {
    section.fields.forEach((field: any) => {
      if (field.coreValues && fields[field.id]?.value !== null) {
        values.push(fields[field.id].value as number);
      }
    });
  });

  return values;
}

export function calculateRubricAverage(rubric: any): number {
  if (!rubric?.data?.fields) return 0;

  const fields = rubric.data.fields as RubricFields;
  const values = Object.values(fields)
    .filter(field => field.value !== null)
    .map(field => field.value || 0);

  return calculateAverage(values);
}

export function getCategoryRadarColor(category: string): string {
  const colors = {
    innovation_project: blue[300],
    robot_design: green[300],
    core_values: red[300]
  };
  return colors[category.replace('-', '_') as keyof typeof colors] || blue[300];
}

export function processCoreValuesRadarData(
  team: Team,
  tIpSections: (key: string) => string
): RadarChartDataPoint[] {
  const ipRubric = team.rubrics.innovation_project;
  const rdRubric = team.rubrics.robot_design;

  if (!ipRubric?.data?.fields && !rdRubric?.data?.fields) {
    return [];
  }

  const ipSchema = rubrics['innovation-project'];
  const rdSchema = rubrics['robot-design'];

  const ipSectionScores = extractCoreValuesBySection(ipRubric, ipSchema);
  const rdSectionScores = extractCoreValuesBySection(rdRubric, rdSchema);

  return ipSchema.sections.map(section => {
    const ipScores = ipSectionScores[section.id] || [];
    const rdScores = rdSectionScores[section.id] || [];
    const allScores = [...ipScores, ...rdScores];

    return {
      field: tIpSections(section.id),
      score: calculateAverage(allScores)
    };
  });
}

export function processRubricRadarData(
  rubric: any,
  category: string,
  tSections: (key: string) => string
): RadarChartDataPoint[] {
  if (!rubric?.data?.fields) return [];

  const schema = rubrics[category as keyof typeof rubrics];
  if (!schema || typeof schema === 'string' || !schema.sections) return [];

  const fields = rubric.data.fields as RubricFields;

  return schema.sections.map(section => {
    const sectionScores = section.fields
      .map((field: any) => fields[field.id]?.value)
      .filter(
        (value: number | null | undefined): value is number => value !== null && value !== undefined
      );

    return {
      field: tSections(section.id),
      score: calculateAverage(sectionScores)
    };
  });
}

export function processAllCategoriesRadarData(
  team: Team,
  getCategory: (key: string) => string
): CategoryDataPoint[] {
  const result: CategoryDataPoint[] = [];

  const ipAvg = calculateRubricAverage(team.rubrics.innovation_project);
  result.push({ category: getCategory('innovation-project'), score: ipAvg });

  const rdAvg = calculateRubricAverage(team.rubrics.robot_design);
  result.push({ category: getCategory('robot-design'), score: rdAvg });

  const ipSchema = rubrics['innovation-project'];
  const rdSchema = rubrics['robot-design'];

  const ipCoreValues = extractCoreValuesFields(team.rubrics.innovation_project, ipSchema);
  const rdCoreValues = extractCoreValuesFields(team.rubrics.robot_design, rdSchema);
  const allCoreValues = [...ipCoreValues, ...rdCoreValues];

  const cvAvg = calculateAverage(allCoreValues);
  result.push({ category: getCategory('core-values'), score: cvAvg });

  return result;
}
