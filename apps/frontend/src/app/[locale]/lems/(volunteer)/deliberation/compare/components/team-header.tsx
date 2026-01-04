'use client';

import { useMemo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { useCompareContext } from '../compare-context';
import type { Team, RubricFieldValue } from '../graphql/types';

interface TeamHeaderProps {
  team: Team;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const { category } = useCompareContext();

  // Calculate average score
  const averageScore = useMemo(() => {
    const rubrics = Object.values(team.rubrics).filter(Boolean);
    if (rubrics.length === 0) return 0;

    let totalScore = 0;
    let totalFields = 0;

    rubrics.forEach(rubric => {
      if (rubric?.data?.fields) {
        Object.values(rubric.data.fields).forEach((fieldValue: unknown) => {
          const typedField = fieldValue as RubricFieldValue;
          if (typedField && typedField.value) {
            totalScore += typedField.value;
            totalFields++;
          }
        });
      }
    });

    return totalFields > 0 ? totalScore / totalFields : 0;
  }, [team.rubrics]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          #{team.number} - {team.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {team.affiliation}
        </Typography>
        {team.judgingSession?.room && (
          <Typography variant="body2" color="text.secondary">
            {team.judgingSession.room.name}
          </Typography>
        )}
        <Chip
          label={`Avg: ${averageScore.toFixed(2)}`}
          size="small"
          color={team.arrived ? 'success' : 'default'}
          sx={{ mt: 1 }}
        />
      </Box>

      <Box>
        {category ? (
          <CategoryRadarChart team={team} category={category} />
        ) : (
          <AllCategoriesRadarChart team={team} />
        )}
      </Box>
    </Stack>
  );
}

interface CategoryRadarChartProps {
  team: Team;
  category: string;
}

function CategoryRadarChart({ team, category }: CategoryRadarChartProps) {
  const rubricKey = category.replace('-', '_') as keyof typeof team.rubrics;
  const rubric = team.rubrics[rubricKey];

  const data = useMemo(() => {
    if (!rubric?.data?.fields) return [];

    const fields = Object.entries(
      rubric.data.fields as Record<string, { value: number | null; notes?: string }>
    )
      .filter(([, field]) => field.value !== null)
      .map(([id, field]) => ({
        field: id.split('-').slice(-2).join(' '),
        score: field.value || 0
      }));

    return fields;
  }, [rubric]);

  const color = useMemo(() => {
    const colors = {
      innovation_project: blue[300],
      robot_design: green[300],
      core_values: red[300]
    };
    return colors[rubricKey as keyof typeof colors] || blue[300];
  }, [rubricKey]);

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No rubric data
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="field" tick={{ fontSize: 8 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 10 }} />
        <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface AllCategoriesRadarChartProps {
  team: Team;
}

function AllCategoriesRadarChart({ team }: AllCategoriesRadarChartProps) {
  const { getCategory } = useJudgingCategoryTranslations();

  const data = useMemo(() => {
    const categories = [
      { key: 'innovation_project', category: 'innovation-project' },
      { key: 'robot_design', category: 'robot-design' },
      { key: 'core_values', category: 'core-values' }
    ];

    return categories.map(({ key, category }) => {
      const rubric = team.rubrics[key as keyof typeof team.rubrics];
      if (!rubric?.data?.fields) {
        return { category: getCategory(category), score: 0 };
      }

      // Calculate average score from all field values
      const fieldValues = Object.values(
        rubric.data.fields as Record<string, { value: number | null; notes?: string }>
      )
        .filter(field => field.value !== null)
        .map(field => field.value || 0);

      const avgScore =
        fieldValues.length > 0
          ? fieldValues.reduce((sum, val) => sum + val, 0) / fieldValues.length
          : 0;

      return {
        category: getCategory(category),
        score: avgScore
      };
    });
  }, [team, getCategory]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 10 }} />
        <Radar dataKey="score" stroke={blue[300]} fill={blue[300]} fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
