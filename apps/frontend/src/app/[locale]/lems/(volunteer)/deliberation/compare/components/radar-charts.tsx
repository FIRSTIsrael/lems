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

const RadarChartContainer = ({
  data,
  dataKey,
  color = '#64B5F6'
}: {
  data: any[];
  dataKey: string;
  color?: string;
}) => (
  <ResponsiveContainer width="100%" height={250}>
    <RadarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
      <PolarGrid />
      <PolarAngleAxis dataKey={dataKey} tick={{ fontSize: 14 }} />
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
