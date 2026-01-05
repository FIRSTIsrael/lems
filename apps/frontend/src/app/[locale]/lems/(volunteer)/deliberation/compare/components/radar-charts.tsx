'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { useJudgingCategoryTranslations } from '@lems/localization';
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
  const tSections = useTranslations(`pages.judge.schedule.rubric-sections.${category}`);
  const tIpSections = useTranslations('pages.judge.schedule.rubric-sections.innovation-project');

  const data = useMemo(() => {
    if (category === 'core-values') {
      return processCoreValuesRadarData(team, tIpSections);
    }

    const rubricKey = category.replace('-', '_') as keyof typeof team.rubrics;
    const rubric = team.rubrics[rubricKey];
    return processRubricRadarData(rubric, category, tSections);
  }, [team, category, tSections, tIpSections]);

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
        <PolarAngleAxis dataKey="field" tick={{ fontSize: 11 }} />
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
        <Radar dataKey="score" stroke={blue[300]} fill={blue[300]} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
