'use client';

import { useTranslations } from 'next-intl';
import { Stack, Typography, Box } from '@mui/material';
import type { Team } from '../graphql/types';

interface GpScoresProps {
  team: Team;
}

export function GpScores({ team }: GpScoresProps) {
  const t = useTranslations('layouts.deliberation.compare');

  const scoresheets = team.scoresheets.filter(s => s.data?.gp?.value);

  if (scoresheets.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight={600}>
        {t('gp-scores')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%' }}>
        {scoresheets.map(scoresheet => {
          const gp = scoresheet.data?.gp;

          return (
            <Box
              key={scoresheet.id}
              sx={{
                p: 1.5,
                border: 2,
                borderColor: 'primary.main',
                borderRadius: 2,
                bgcolor: 'primary.50',
                flex: 1,
                textAlign: 'center'
              }}
            >
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight={700}
                sx={{ fontSize: '0.75rem' }}
              >
                {t('round')} {scoresheet.round}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'center' }}>
                {Array.from({ length: gp?.value ?? 3 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: 'primary.main'
                    }}
                  />
                ))}
              </Box>
              {gp?.notes && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    display: 'block',
                    fontSize: '0.7rem',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
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
