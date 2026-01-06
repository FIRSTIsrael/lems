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

function SectionName({ category, fieldId }: { category: string; fieldId: string }) {
  const { getSectionTitle } = useRubricsTranslations(category as JudgingCategory);

  const sectionId = rubrics[category as JudgingCategory]?.sections?.find(section =>
    section.fields.some(field => field.id === fieldId)
  )?.id;

  return <>{sectionId ? getSectionTitle(sectionId) : fieldId}</>;
}

function NoteItem({
  category,
  note
}: {
  category: string;
  note: { fieldId: string; notes: string };
}) {
  return (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="caption" color="primary" fontWeight={600}>
        <SectionName category={category} fieldId={note.fieldId} />
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {note.notes}
      </Typography>
    </Box>
  );
}

export function ExceedingNotes({ team }: ExceedingNotesProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { getCategory } = useJudgingCategoryTranslations();
  const { category } = useCompareContext();

  const exceedingNotesByCategory = useMemo(() => {
    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];
    const result: Record<string, Array<{ fieldId: string; notes: string }>> = {};

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const fields = team.rubrics[rubricKey]?.data?.fields;

      if (fields) {
        const exceedingFields = Object.entries(fields)
          .filter(([, field]) => field.value === 4 && field.notes)
          .map(([fieldId, field]) => ({ fieldId, notes: field.notes! }));

        if (exceedingFields.length > 0) {
          result[cat] = exceedingFields;
        }
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
              <NoteItem key={index} category={category} note={note} />
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
                        <NoteItem category={cat} note={note} />
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
