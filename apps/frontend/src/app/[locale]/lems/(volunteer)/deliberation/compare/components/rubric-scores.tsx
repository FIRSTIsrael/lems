'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Grid, Paper } from '@mui/material';
import type { Team } from '../graphql/types';
import { useCompareContext } from '../compare-context';
import {
  processFieldsByCategory,
  getCategoryColor,
  getCategoryBgColor
} from './rubric-scores-utils';
import { RubricFieldRow } from './rubric-field-row';

interface RubricScoresProps {
  team: Team;
}

export function RubricScores({ team }: RubricScoresProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const tFields = useTranslations('pages.judge.schedule.rubric-fields');
  const tRubric = useTranslations('pages.judge.schedule.rubric-labels');
  const { fieldComparisons, category } = useCompareContext();

  const fieldsByCategory = useMemo(() => {
    return processFieldsByCategory(team, fieldComparisons, category);
  }, [team, fieldComparisons, category]);

  const hasAnyFields = Object.values(fieldsByCategory).some(fields => fields.length > 0);

  if (!hasAnyFields) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t('no-rubric-data')}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
        {t('rubric-scores')}
      </Typography>

      {category ? (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: getCategoryBgColor(category),
            border: `2px solid ${getCategoryColor(category)}`,
            borderRadius: 2,
            maxHeight: 300,
            overflowY: 'auto'
          }}
        >
          <Stack spacing={0.5}>
            {Object.entries(fieldsByCategory).map(([, fields]) =>
              fields.map(field => (
                <RubricFieldRow
                  key={`${field.category}-${field.fieldId}`}
                  field={field}
                  tFields={tFields}
                />
              ))
            )}
          </Stack>
        </Paper>
      ) : (
        <Grid container spacing={1}>
          {Object.entries(fieldsByCategory).map(([cat, fields]) => {
            if (fields.length === 0) return null;

            return (
              <Grid size={4} key={cat}>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: getCategoryBgColor(cat),
                    border: `2px solid ${getCategoryColor(cat)}`,
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: getCategoryColor(cat),
                      textAlign: 'center',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    {tRubric(cat as 'innovation-project' | 'robot-design' | 'core-values')}
                  </Typography>

                  <Stack spacing={0.5}>
                    {fields.map(field => (
                      <RubricFieldRow
                        key={`${field.category}-${field.fieldId}`}
                        field={field}
                        tFields={tFields}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
