'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRubricsTranslations, useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import { Stack, Typography, Box, Grid, Paper } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';
import { getCategoryColor, getCategoryBgColor } from './rubric-scores-utils';

interface ExceedingNotesProps {
  team: Team;
}

function findSectionId(category: string, fieldId: string): string | null {
  const rubricCategory = rubrics[category as JudgingCategory];
  if (!rubricCategory?.sections) return null;

  for (const section of rubricCategory.sections) {
    if (section.fields.some(field => field.id === fieldId)) {
      return section.id;
    }
  }
  return null;
}

function FieldName({ category, fieldId }: { category: string; fieldId: string }) {
  const { getFieldLevel } = useRubricsTranslations(category as JudgingCategory);
  const sectionId = findSectionId(category, fieldId);

  const fieldName = sectionId ? getFieldLevel(sectionId, fieldId, 'beginning') : fieldId;
  return <>{fieldName}</>;
}

export function ExceedingNotes({ team }: ExceedingNotesProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
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
                  <FieldName category={category} fieldId={note.fieldId} />
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
                    {getCategory(cat as 'innovation-project' | 'robot-design' | 'core-values')}
                  </Typography>
                  <Grid container spacing={1}>
                    {notes.map((note, index) => (
                      <Grid key={index} size={6}>
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            <FieldName category={cat} fieldId={note.fieldId} />
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
