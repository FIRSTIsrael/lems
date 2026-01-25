'use client';

import { useMemo } from 'react';
import { Box, Paper, alpha, Stack, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useMatchTranslations } from '@lems/localization';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  createMatchLoadedSubscription,
  GET_MATCH_PREVIEW_DATA,
  parseMatchPreviewData
} from './graphql';
import { MatchParticipantCard } from './match-participant-card';

export const MatchPreviewDisplay = () => {
  const { currentDivision } = useEvent();
  const { getStage } = useMatchTranslations();
  const t = useTranslations('pages.audience-display.match-preview');

  const subscriptions = useMemo(
    () => [createMatchLoadedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_MATCH_PREVIEW_DATA,
    {
      divisionId: currentDivision.id
    },
    parseMatchPreviewData,
    subscriptions
  );

  const activeMatch = useMemo(() => {
    if (!data) return null;
    return data.matches.find(match => match.id === data.loadedMatch) || null;
  }, [data]);

  if (error) {
    throw error || new Error('Failed to load match preview data');
  }

  if (loading || !data || !activeMatch) {
    return null;
  }

  const filteredParticipants = activeMatch.participants.filter(p => p.team !== null);

  const columns =
    filteredParticipants.length <= 5
      ? filteredParticipants.length
      : Math.ceil(filteredParticipants.length / 2);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/assets/audience-display/audience-display-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 4
      }}
    >
      <Box
        component={Paper}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1800px',
          p: 6,
          bgcolor: theme => alpha(theme.palette.background.paper, 0.98),
          borderRadius: 2,
          animation: 'fadeInScale 0.6s ease-out'
        }}
      >
        <Stack spacing={4} height="100%">
          <Grid container spacing={3} alignItems="center">
            <Grid size={2} display="flex" justifyContent="center">
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '120px'
                }}
              >
                <Image
                  src="/assets/audience-display/first-horizontal.svg"
                  alt="FIRST Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Grid>

            <Grid size={8} display="flex" flexDirection="column" justifyContent="center">
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                  fontWeight: 800,
                  textAlign: 'center',
                  mb: 1
                }}
              >
                {t('round')} {getStage(activeMatch.stage)} #{activeMatch.round}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem', lg: '3.5rem' },
                  fontWeight: 700,
                  textAlign: 'center',
                  color: 'text.secondary'
                }}
              >
                {t('match')} #{activeMatch.number}
              </Typography>
            </Grid>

            <Grid size={2} display="flex" justifyContent="center">
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '120px'
                }}
              >
                <Image
                  src="/assets/audience-display/sponsors/lego-education.svg"
                  alt="Lego Education"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
            columns={columns}
            sx={{
              animation: 'fadeIn 0.8s ease-out',
              justifyContent: 'center'
            }}
          >
            {filteredParticipants.map(participant => (
              <MatchParticipantCard key={participant?.team?.id} participant={participant} />
            ))}
          </Grid>
        </Stack>
      </Box>

      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};
