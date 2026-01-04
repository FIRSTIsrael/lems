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
  const tFields = useTranslations('pages.judge.schedule.rubric-fields');
  const tRubric = useTranslations('pages.judge.schedule.rubric-labels');
  const { fieldComparisons, category } = useCompareContext();

  const fieldsByCategory = useMemo(() => {
    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    const result: Record<
      string,
      Array<{
        fieldId: string;
        category: string;
        value: number | null;
        color: 'success' | 'error' | 'warning' | 'default';
      }>
    > = {};

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      result[cat] = [];

      if (rubric?.data?.fields) {
        Object.entries(rubric.data.fields).forEach(([fieldId, field]) => {
          const comparison = fieldComparisons.get(fieldId);
          let color: 'success' | 'error' | 'warning' | 'default' = 'default';

          if (comparison) {
            const teamValue = comparison.values.get(team.id);
            if (teamValue !== undefined && comparison.max > comparison.min) {
              if (teamValue === comparison.max) {
                color = 'success';
              } else if (teamValue === comparison.min) {
                color = 'error';
              } else {
                color = 'warning';
              }
            }
          }

          result[cat].push({ fieldId, category: cat, value: field.value, color });
        });
      }
    });

    return result;
  }, [team, fieldComparisons, category, tFields, tRubric]);

  const hasAnyFields = Object.values(fieldsByCategory).some(fields => fields.length > 0);

  if (!hasAnyFields) {
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
        <Stack spacing={1}>
          {Object.entries(fieldsByCategory).map(([cat, fields]) => {
            if (fields.length === 0) return null;

            return (
              <Box key={cat}>
                {!category && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      mb: 0.5,
                      display: 'block'
                    }}
                  >
                    {tRubric(cat as 'innovation-project' | 'robot-design' | 'core-values')}
                  </Typography>
                )}
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
                        {tFields(`${field.category}.${field.fieldId}`)}
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
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
