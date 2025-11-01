'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Grid, Box, Divider } from '@mui/material';
import { useTeamAtEventData } from '../team-at-event-data-context';

export const MatchResults: React.FC = () => {
  const { scoreboard } = useTeamAtEventData();
  const t = useTranslations('pages.team-in-event');

  const displayScores =
    scoreboard?.scores && scoreboard.scores.length > 0 ? scoreboard.scores : [0, 0, 0];

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="h6" fontWeight="700" mb={1}>
          {t('performance.match-results')}
        </Typography>
        <Grid container spacing={2}>
          {displayScores.map((score, index) => (
            <Grid
              size={{ xs: 6, sm: 4, md: 3 }}
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="body2" fontWeight="600">
                {t('performance.match-number', { number: index + 1 })}
              </Typography>
              <Typography variant="body1" fontWeight="600" color="primary">
                {score}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};
