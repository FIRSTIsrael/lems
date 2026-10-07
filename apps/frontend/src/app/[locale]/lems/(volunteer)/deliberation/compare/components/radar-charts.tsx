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
  ResponsiveContainer,
  useChartWidth
} from 'recharts';
import { useJudgingCategoryTranslations, useRubricsTranslations } from '@lems/localization';
import { JudgingCategory } from '@lems/types/judging';
import { useEdition } from '../../../hooks/use-edition';
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

const TICK_FONT_SIZE = 11;
const TICK_LINE_HEIGHT_EM = 1.15;
const TICK_CHAR_WIDTH = TICK_FONT_SIZE * 0.65;
const TICK_EDGE_PADDING = 4;

const wrapLabel = (text: string, maxChars: number) => {
  const lines: string[] = [];
  let current = '';
  text
    .split(/\s+/)
    .filter(Boolean)
    .forEach(word => {
      const fitted = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
      const candidate = current ? `${current} ${fitted}` : fitted;
      if (!current || candidate.length <= maxChars) {
        current = candidate;
      } else {
        lines.push(current);
        current = fitted;
      }
    });
  if (current) lines.push(current);
  return lines;
};

const CustomTick = ({ payload, x = 0, y = 0, cx = 0, cy = 0 }: CustomTickProps) => {
  const chartWidth = useChartWidth() ?? cx * 2;
  const isCenteredX = Math.abs(x - cx) < 1;
  const isCenteredY = Math.abs(y - cy) < 1;
  const textAnchor = isCenteredX ? 'middle' : x > cx ? 'start' : 'end';

  const availableWidth =
    textAnchor === 'middle'
      ? 2 * Math.min(x, chartWidth - x)
      : textAnchor === 'start'
        ? chartWidth - x
        : x;
  const maxChars = Math.max(3, Math.floor((availableWidth - TICK_EDGE_PADDING) / TICK_CHAR_WIDTH));
  const lines = wrapLabel(payload?.value ?? '', maxChars);

  const firstLineOffset = isCenteredY
    ? -((lines.length - 1) / 2) * TICK_LINE_HEIGHT_EM
    : y < cy
      ? -(lines.length - 1) * TICK_LINE_HEIGHT_EM
      : 0;

  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline={isCenteredY ? 'middle' : y > cy ? 'hanging' : 'auto'}
      fontSize={TICK_FONT_SIZE}
      fill="currentColor"
    >
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={`${index === 0 ? firstLineOffset : TICK_LINE_HEIGHT_EM}em`}>
          {line}
        </tspan>
      ))}
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
    <RadarChart data={data} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
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
  const edition = useEdition();

  const data = useMemo(() => {
    if (category === 'core-values')
      return processCoreValuesRadarData(edition, team, getIpSectionTitle);
    const rubric = team.rubrics[category.replace('-', '_') as keyof typeof team.rubrics];
    return processRubricRadarData(edition, rubric, category, getSectionTitle);
  }, [edition, team, category, getSectionTitle, getIpSectionTitle]);

  if (data.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
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
  const edition = useEdition();
  const data = useMemo(
    () => processAllCategoriesRadarData(edition, team, getCategory),
    [edition, team, getCategory]
  );
  return <RadarChartContainer data={data} dataKey="category" />;
};
