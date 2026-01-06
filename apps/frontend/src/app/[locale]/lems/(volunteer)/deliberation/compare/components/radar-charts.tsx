'use client';

import { useMemo } from 'react';
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

export function CategoryRadarChart({ team, category }: CategoryRadarChartProps) {
  const { getSectionTitle: getIpSectionTitle } = useRubricsTranslations('innovation-project');
  const { getSectionTitle } = useRubricsTranslations(category as JudgingCategory);

  const data = useMemo(() => {
    if (category === 'core-values') {
      return processCoreValuesRadarData(team, getIpSectionTitle);
    }

    const rubricKey = category.replace('-', '_') as keyof typeof team.rubrics;
    const rubric = team.rubrics[rubricKey];
    return processRubricRadarData(rubric, category, getSectionTitle);
  }, [team, category, getSectionTitle, getIpSectionTitle]);

  const color = getCategoryRadarColor(category);

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No rubric data
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="field" tick={{ fontSize: 14 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 12 }} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface AllCategoriesRadarChartProps {
  team: Team;
}

export function AllCategoriesRadarChart({ team }: AllCategoriesRadarChartProps) {
  const { getCategory } = useJudgingCategoryTranslations();

  const data = useMemo(() => {
    return processAllCategoriesRadarData(team, getCategory);
  }, [team, getCategory]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 14 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 12 }} />
        <Radar dataKey="score" stroke="#64B5F6" fill="#64B5F6" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
