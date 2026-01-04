'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Chip, Box } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface RubricScoresProps {
  team: Team;
}

export function RubricScores({ team }: RubricScoresProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { fieldComparisons, category } = useCompareContext();

  const fields = useMemo(() => {
    const result: Array<{
      fieldId: string;
      category: string;
      value: number | null;
      color: 'success' | 'error' | 'warning' | 'default';
    }> = [];

    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      if (rubric?.data?.fields) {
        Object.entries(rubric.data.fields).forEach(([fieldId, field]) => {
          const comparison = fieldComparisons.get(fieldId);
          if (!comparison) {
            result.push({ fieldId, category: cat, value: field.value, color: 'default' });
            return;
          }

          const teamValue = comparison.values.get(team.id);
          if (teamValue === undefined) {
            result.push({ fieldId, category: cat, value: field.value, color: 'default' });
            return;
          }

          let color: 'success' | 'error' | 'warning' | 'default' = 'default';
          if (comparison.max > comparison.min) {
            if (teamValue === comparison.max) {
              color = 'success';
            } else if (teamValue === comparison.min) {
              color = 'error';
            } else {
              color = 'warning';
            }
          }

          result.push({ fieldId, category: cat, value: field.value, color });
        });
      }
    });

    return result;
  }, [team, fieldComparisons, category]);

  if (fields.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t('no-rubric-data')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('rubric-scores')}
      </Typography>
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        <Stack spacing={0.5}>
          {fields.map(field => (
            <Stack
              key={`${field.category}-${field.fieldId}`}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Typography variant="caption" sx={{ flex: 1, fontSize: '0.7rem' }}>
                {field.fieldId.split('-').slice(-2).join(' ')}
              </Typography>
              <Chip
                label={field.value ?? 'N/A'}
                size="small"
                color={field.color}
                sx={{ minWidth: 40, height: 20, fontSize: '0.7rem' }}
              />
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
