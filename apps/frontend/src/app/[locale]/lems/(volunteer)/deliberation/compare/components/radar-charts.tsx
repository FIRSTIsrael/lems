'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { useJudgingCategoryTranslations, useRubricsTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import type { Team } from '../graphql/types';
import {
  processCoreValuesRadarData,
  processRubricRadarData,
  processAllCategoriesRadarData,
  getCategoryRadarColor
} from './radar-chart-utils';

interface CategoryRadarChartProps {
  team: Team;
  category: string;
}

interface CustomTickProps {
  payload?: { value: string };
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
}

const CustomTick = ({ payload, x = 0, y = 0, cx = 0, cy = 0 }: CustomTickProps) => {
  const maxLength = 20;
  const text = payload?.value || '';
  const truncated = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
      dominantBaseline={y > cy ? 'hanging' : y < cy ? 'auto' : 'middle'}
      fontSize={11}
      fill="currentColor"
    >
      {truncated}
    </text>
  );
};

interface RadarChartContainerProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey: string;
  color?: string;
}

const RadarChartContainer = ({ data, dataKey, color = '#64B5F6' }: RadarChartContainerProps) => (
  <ResponsiveContainer width="100%" height={250}>
    <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
      <PolarGrid />
      <PolarAngleAxis dataKey={dataKey} tick={<CustomTick />} />
      <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 12 }} />
      <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.6} />
    </RadarChart>
  </ResponsiveContainer>
);

export const CategoryRadarChart = ({ team, category }: CategoryRadarChartProps) => {
  const t = useTranslations('layouts.deliberation.compare');
  const { getSectionTitle: getIpSectionTitle } = useRubricsTranslations('innovation-project');
  const { getSectionTitle } = useRubricsTranslations(category as JudgingCategory);

  const data = useMemo(() => {
    if (category === 'core-values') return processCoreValuesRadarData(team, getIpSectionTitle);
    const rubric = team.rubrics[category.replace('-', '_') as keyof typeof team.rubrics];
    return processRubricRadarData(rubric, category, getSectionTitle);
  }, [team, category, getSectionTitle, getIpSectionTitle]);

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t('no-rubric-data')}
      </Typography>
    );
  }

  return (
    <RadarChartContainer data={data} dataKey="field" color={getCategoryRadarColor(category)} />
  );
};

interface AllCategoriesRadarChartProps {
  team: Team;
}

export const AllCategoriesRadarChart = ({ team }: AllCategoriesRadarChartProps) => {
  const { getCategory } = useJudgingCategoryTranslations();
  const data = useMemo(() => processAllCategoriesRadarData(team, getCategory), [team, getCategory]);
  return <RadarChartContainer data={data} dataKey="category" />;
};
