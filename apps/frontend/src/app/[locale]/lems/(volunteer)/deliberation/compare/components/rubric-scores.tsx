'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Chip, Box, Grid, Paper } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import { rubrics } from '@lems/shared/rubrics';
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
      result[cat] = [];

      if (cat === 'core-values') {
        // For core-values, get coreValues fields from IP and RD rubrics
        const ipRubric = team.rubrics.innovation_project;
        const rdRubric = team.rubrics.robot_design;

        const ipSchema = rubrics['innovation-project'];
        const rdSchema = rubrics['robot-design'];

        // Collect coreValues fields from IP
        if (ipRubric?.data?.fields) {
          const ipFields = ipRubric.data.fields as Record<
            string,
            { value: number | null; notes?: string }
          >;
          ipSchema.sections.forEach(
            (section: { id: string; fields: { id: string; coreValues?: boolean }[] }) => {
              section.fields.forEach((field: { id: string; coreValues?: boolean }) => {
                if (field.coreValues && ipFields[field.id]) {
                  const comparison = fieldComparisons.get(`ip-${field.id}`);
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

                  result[cat].push({
                    fieldId: field.id,
                    category: 'innovation-project',
                    value: ipFields[field.id].value,
                    color
                  });
                }
              });
            }
          );
        }

        // Collect coreValues fields from RD
        if (rdRubric?.data?.fields) {
          const rdFields = rdRubric.data.fields as Record<
            string,
            { value: number | null; notes?: string }
          >;
          rdSchema.sections.forEach(
            (section: { id: string; fields: Array<{ id: string; coreValues?: boolean }> }) => {
              section.fields.forEach((field: { id: string; coreValues?: boolean }) => {
                if (field.coreValues && rdFields[field.id]) {
                  const comparison = fieldComparisons.get(`rd-${field.id}`);
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

                  result[cat].push({
                    fieldId: field.id,
                    category: 'robot-design',
                    value: rdFields[field.id].value,
                    color
                  });
                }
              });
            }
          );
        }
      } else {
        // For IP/RD, use their own rubric fields
        const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
        const rubric = team.rubrics[rubricKey];

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
      }
    });

    return result;
  }, [team, fieldComparisons, category]);

  const hasAnyFields = Object.values(fieldsByCategory).some(fields => fields.length > 0);

  if (!hasAnyFields) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {t('no-rubric-data')}
      </Typography>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'innovation-project':
        return blue[500];
      case 'robot-design':
        return green[500];
      case 'core-values':
        return red[500];
      default:
        return blue[500];
    }
  };

  const getCategoryBgColor = (cat: string) => {
    switch (cat) {
      case 'innovation-project':
        return blue[50];
      case 'robot-design':
        return green[50];
      case 'core-values':
        return red[50];
      default:
        return blue[50];
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('rubric-scores')}
      </Typography>

      {category ? (
        // Single category view - vertical layout with category background
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
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: getCategoryColor(category),
              textAlign: 'center',
              mb: 1,
              display: 'block'
            }}
          >
            {tRubric(category as 'innovation-project' | 'robot-design' | 'core-values')}
          </Typography>

          <Stack spacing={0.5}>
            {Object.entries(fieldsByCategory).map(([, fields]) =>
              fields.map(field => (
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
              ))
            )}
          </Stack>
        </Paper>
      ) : (
        // All categories view - horizontal color-coded layout
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
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
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
                      <Stack
                        key={`${field.category}-${field.fieldId}`}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={0.5}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            flex: 1,
                            fontSize: '0.65rem',
                            color: 'text.primary'
                          }}
                        >
                          {tFields(`${field.category}.${field.fieldId}`)}
                        </Typography>
                        <Chip
                          label={field.value ?? 'N/A'}
                          size="small"
                          color={field.color}
                          sx={{
                            minWidth: 32,
                            height: 18,
                            fontSize: '0.65rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      </Stack>
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
