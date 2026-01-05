'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Box, Grid, Paper } from '@mui/material';
import { useCompareContext } from '../compare-context';
import { getCategoryColor, getCategoryBgColor } from './rubric-scores-utils';
import type { Team } from '../graphql/types';

interface ExceedingNotesProps {
  team: Team;
}

export function ExceedingNotes({ team }: ExceedingNotesProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const tFields = useTranslations('pages.judge.schedule.rubric-fields');
  const tRubric = useTranslations('pages.judge.schedule.rubric-labels');
  const { category } = useCompareContext();

  const exceedingNotesByCategory = useMemo(() => {
    const result: Record<string, Array<{ fieldId: string; notes: string }>> = {};

    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      if (rubric?.data?.fields) {
        Object.entries(rubric.data.fields).forEach(([fieldId, field]) => {
          if (field.value === 4 && field.notes) {
            if (!result[cat]) {
              result[cat] = [];
            }
            result[cat].push({
              fieldId,
              notes: field.notes
            });
          }
        });
      }
    });

    return result;
  }, [team, category]);

  if (Object.keys(exceedingNotesByCategory).length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('exceeding-notes')}
      </Typography>
      {category ? (
        <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
          <Stack spacing={1}>
            {exceedingNotesByCategory[category]?.map((note, index) => (
              <Box key={index} sx={{ p: 1 }}>
                <Typography variant="caption" color="primary" fontWeight={600}>
                  {tFields(`${category}.${note.fieldId}`)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {note.notes}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
          <Grid container spacing={1}>
            {Object.entries(exceedingNotesByCategory).map(([cat, notes]) => (
              <Grid key={cat} size={12}>
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
                  <Grid container spacing={1}>
                    {notes.map((note, index) => (
                      <Grid key={index} size={6}>
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            {tFields(`${cat}.${note.fieldId}`)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {note.notes}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Stack>
  );
}
