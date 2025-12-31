'use client';

import { useTranslations } from 'next-intl';
import { Stack, Typography, Box } from '@mui/material';
import type { Team } from '../graphql/types';

interface GpScoresProps {
  team: Team;
}

export function GpScores({ team }: GpScoresProps) {
  const t = useTranslations('pages.deliberation.compare');

  const scoresheets = team.scoresheets.filter(s => s.data?.gp?.value);

  if (scoresheets.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('gp-scores')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {scoresheets.map(scoresheet => {
          const gp = scoresheet.data?.gp;
          if (!gp?.value) return null;

          return (
            <Box
              key={scoresheet.id}
              sx={{
                p: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                minWidth: 60
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t('round')} {scoresheet.round}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {Array.from({ length: gp.value - 1 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main'
                    }}
                  />
                ))}
              </Box>
              {gp.notes && (
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {gp.notes}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
