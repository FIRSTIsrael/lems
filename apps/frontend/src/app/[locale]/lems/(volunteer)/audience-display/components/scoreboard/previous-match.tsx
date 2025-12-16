'use client';

import { useMemo } from 'react';
import { Box, Grid, Paper, Typography, alpha, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useScoreboard } from './scoreboard-context';
import { TeamScoreCard } from './team-score-card';

export const PreviousMatch = () => {
  const { previousMatch, matches, scoresheets } = useScoreboard();
  const t = useTranslations('pages.scorekeeper.audience-display.scoreboard');

  const match = useMemo(() => {
    if (!previousMatch) return null;
    return matches.find(m => m.id === previousMatch) || null;
  }, [previousMatch, matches]);

  const matchScoresheets = useMemo(() => {
    if (!match) return [];
    return scoresheets.filter(s => s.stage === match.stage && s.round === match.round);
  }, [match, scoresheets]);

  const filteredParticipants = match?.participants.filter(p => p.team !== null) ?? [];

  const columns =
    filteredParticipants.length <= 5
      ? filteredParticipants.length
      : Math.ceil(filteredParticipants.length / 2);

  return (
    <>
      <Paper
        sx={{
          p: 1.5,
          bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
          borderRadius: 1.5
        }}
      >
        <Stack spacing={1}>
          <Box>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', md: '0.85rem', lg: '0.9rem' },
                fontWeight: 600,
                color: 'text.secondary',
                mb: 0.25,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {t('previous-match.title')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem', lg: '1.5rem' },
                fontWeight: 700,
                color: 'primary.main',
                mb: 0.5,
                lineHeight: 1.2
              }}
            >
              {match?.number ? `${t('previous-match.match')} #${match.number}` : t('no-match')}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.7rem', md: '0.8rem', lg: '0.85rem' },
                color: 'text.secondary',
                fontStyle: 'italic'
              }}
            >
              {t('previous-match.disclaimer')}
            </Typography>
          </Box>

          <Grid
            container
            spacing={1}
            columns={columns}
            sx={{
              animation: 'fadeIn 0.6s ease-out'
            }}
          >
            {filteredParticipants.map(participant => {
              const scoresheet = matchScoresheets.find(s => s.team.id === participant.team?.id);

              return (
                <Grid key={participant.team?.id} size={1}>
                  <TeamScoreCard
                    teamNumber={participant.team!.number}
                    teamName={participant.team!.name}
                    score={scoresheet?.data?.score ?? null}
                    status={scoresheet?.status ?? 'empty'}
                    escalated={scoresheet?.escalated ?? false}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Paper>
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
