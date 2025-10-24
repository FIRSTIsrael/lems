'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Box, Stack, Divider } from '@mui/material';
import { EmojiEvents, TrendingUp as ScoreIcon, SmartToy as RobotIcon } from '@mui/icons-material';

interface Award {
  id: string;
  name: string;
  place: number;
}

interface TeamScoreboard {
  robotGameRank: number | null;
  maxScore: number | null;
  scores: number[] | null;
}

interface EventSummaryProps {
  teamAwards: Award[];
  teamScoreboard?: TeamScoreboard;
}

const EventSummary: React.FC<EventSummaryProps> = ({ teamAwards, teamScoreboard }) => {
  const t = useTranslations('pages.team-in-event');

  const getAwardIcon = (award: { name: string; place: number }) => {
    switch (award.place) {
      case 1:
        return 'award.first';
      case 2:
        return 'award.second';
      case 3:
        return 'award.third';
      default:
        return 'award.other';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box mb={2}>
        <Typography variant="h6" fontWeight="700" mb={1}>
          {t('performance.event-summary')}
        </Typography>
        <Grid container spacing={2}>
          {teamAwards &&
            teamAwards.map((award, index) => {
              const trophyColor = getAwardIcon(award);
              return (
                <Grid
                  size={{ xs: 12, sm: 6, lg: 3 }}
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <EmojiEvents sx={{ color: trophyColor, fontSize: '1.5rem' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {award.name}
                  </Typography>
                </Grid>
              );
            })}

          {teamScoreboard && teamScoreboard.scores && teamScoreboard.scores.length > 0 && (
            <Grid
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScoreIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="600">
                  {t('performance.highest-score')}
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight="600" color="primary">
                {Math.max(...teamScoreboard.scores)}
              </Typography>
            </Grid>
          )}

          {teamScoreboard && teamScoreboard.robotGameRank && (
            <Grid
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <RobotIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="body1" fontWeight="600">
                  {t('performance.robot-game-rank')}
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight="600" color="primary">
                {teamScoreboard.robotGameRank}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {teamScoreboard && teamScoreboard.scores && teamScoreboard.scores.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="h6" fontWeight="700" mb={1}>
              {t('performance.match-results')}
            </Typography>
            <Grid container spacing={2}>
              {teamScoreboard.scores.map((score, index) => (
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
      )}
    </Paper>
  );
};

export { EventSummary };
