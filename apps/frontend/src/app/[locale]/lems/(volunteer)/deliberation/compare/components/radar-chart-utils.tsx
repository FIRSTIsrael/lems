import { getRubrics } from '@lems/shared/rubrics';
import type { Edition } from '@lems/shared/edition';
import type { Team } from '../graphql/types';

export interface RadarChartDataPoint {
  field: string;
  score: number;
  [key: string]: string | number;
}

export interface CategoryDataPoint {
  category: string;
  score: number;
  [key: string]: string | number;
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
  edition: Edition,
  team: Team,
  getIpSectionTitle: (sectionId: string) => string,
  getRdSectionTitle: (sectionId: string) => string,
  getCategory: (category: string) => string
): RadarChartDataPoint[] => {
  const ipRubric = team.rubrics.innovation_project;
  const rdRubric = team.rubrics.robot_design;
  if (!ipRubric?.data?.fields && !rdRubric?.data?.fields) return [];

  const rubrics = getRubrics(edition);
  const ipSchema = rubrics['innovation-project'];
  const rdSchema = rubrics['robot-design'];
  const ipSectionScores = extractCoreValuesBySection(ipRubric, ipSchema);
  const rdSectionScores = extractCoreValuesBySection(rdRubric, rdSchema);

  const mergedSectionPoint = (sectionId: string, getTitle: (sectionId: string) => string) => ({
    field: getTitle(sectionId),
    score: calculateAverage([
      ...(ipSectionScores[sectionId] || []),
      ...(rdSectionScores[sectionId] || [])
    ])
  });

  const ipSectionIds = ipSchema.sections.map(section => section.id);
  const sharesSectionIds =
    ipSectionIds.length === rdSchema.sections.length &&
    rdSchema.sections.every(section => ipSectionIds.includes(section.id));
  if (sharesSectionIds) {
    return ipSectionIds.map(sectionId => mergedSectionPoint(sectionId, getIpSectionTitle));
  }

  // Editions whose IP and RD sections differ: each rubric's Core Values sections get their own
  // point, scored only from that rubric, even when a section id appears in both rubrics.
  const hasCoreValues = (section: (typeof ipSchema.sections)[number]) =>
    section.fields.some(field => field.coreValues);
  const ipCvSections = ipSchema.sections.filter(hasCoreValues);
  const rdCvSections = rdSchema.sections.filter(hasCoreValues);
  const rdCvSectionIds = rdCvSections.map(section => section.id);
  const ipCvSectionIds = ipCvSections.map(section => section.id);

  const sectionPoint = (
    sectionId: string,
    scores: Record<string, number[]>,
    getTitle: (sectionId: string) => string,
    category: string,
    isShared: boolean
  ) => ({
    field: isShared ? `${getTitle(sectionId)} (${getCategory(category)})` : getTitle(sectionId),
    score: calculateAverage(scores[sectionId] || [])
  });

  return [
    ...ipCvSections.map(section =>
      sectionPoint(
        section.id,
        ipSectionScores,
        getIpSectionTitle,
        'innovation-project',
        rdCvSectionIds.includes(section.id)
      )
    ),
    ...rdCvSections.map(section =>
      sectionPoint(
        section.id,
        rdSectionScores,
        getRdSectionTitle,
        'robot-design',
        ipCvSectionIds.includes(section.id)
      )
    )
  ];
};

export const processRubricRadarData = (
  edition: Edition,
  rubric: any,
  category: string,
  getSectionTitle: (sectionId: string) => string
): RadarChartDataPoint[] => {
  if (!rubric?.data?.fields) return [];
  const rubrics = getRubrics(edition);
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
  edition: Edition,
  team: Team,
  getCategory: (key: string) => string
): CategoryDataPoint[] => {
  const rubrics = getRubrics(edition);
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
