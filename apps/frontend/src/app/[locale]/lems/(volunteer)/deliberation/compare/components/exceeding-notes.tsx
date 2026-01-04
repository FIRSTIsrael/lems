'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Box } from '@mui/material';
import { useCompareContext } from '../compare-context';
import type { Team } from '../graphql/types';

interface ExceedingNotesProps {
  team: Team;
}

export function ExceedingNotes({ team }: ExceedingNotesProps) {
  const t = useTranslations('layouts.deliberation.compare');
  const { category } = useCompareContext();

  const exceedingNotes = useMemo(() => {
    const result: Array<{ fieldId: string; notes: string; category: string }> = [];

    const categories = category
      ? [category]
      : ['innovation-project', 'robot-design', 'core-values'];

    categories.forEach(cat => {
      const rubricKey = cat.replace('-', '_') as keyof typeof team.rubrics;
      const rubric = team.rubrics[rubricKey];

      if (rubric?.data?.fields) {
        Object.entries(rubric.data.fields).forEach(([fieldId, field]) => {
          if (field.value === 4 && field.notes) {
            result.push({
              fieldId,
              notes: field.notes,
              category: cat
            });
          }
        });
      }
    });

    return result;
  }, [team, category]);

  if (exceedingNotes.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('exceeding-notes')}
      </Typography>
      <Box sx={{ maxHeight: 192, overflowY: 'auto' }}>
        <Stack spacing={1.5}>
          {exceedingNotes.map((note, index) => (
            <Box key={index}>
              <Typography variant="caption" color="primary" fontWeight={600}>
                {note.fieldId.split('-').slice(-2).join(' ')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {note.notes}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
