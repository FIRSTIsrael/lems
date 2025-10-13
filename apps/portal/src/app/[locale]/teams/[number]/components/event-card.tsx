'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, Grid } from '@mui/material';
import { TrendingUp as ScoreIcon, EmojiEvents, SmartToy as RobotIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { EventResult } from './mockTeamData';

interface EventCardProps {
  eventResult: EventResult;
}

export const EventCard: React.FC<EventCardProps> = ({ eventResult }) => {
  const t = useTranslations('pages.team.events');

  const getAwardIcon = (award: string) => {
    const winningKeywords = ['winner', 'champion', '1st', '2nd', '3rd', 'first', 'second', 'third'];
    const isWinning = winningKeywords.some(keyword => award.toLowerCase().includes(keyword));

    if (isWinning) {
      if (
        award.toLowerCase().includes('1st') ||
        award.toLowerCase().includes('first') ||
        award.toLowerCase().includes('winner') ||
        award.toLowerCase().includes('champion')
      ) {
        return '#FFD700';
      } else if (award.toLowerCase().includes('2nd') || award.toLowerCase().includes('second')) {
        return '#C0C0C0';
      } else if (award.toLowerCase().includes('3rd') || award.toLowerCase().includes('third')) {
        return '#CD7F32';
      }
    }
    return '#FFA500'; // maybe should be none?
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <CardContent>
        <Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
          {eventResult.eventName}
        </Typography>

        {/* Awards Section */}
        <Box mb={2}>
          <Typography variant="h6" fontWeight="700" mb={1}>
            {t('event-summary')}
          </Typography>
          <Grid container spacing={2}>
            {eventResult.awards &&
              eventResult.awards.length > 0 &&
              eventResult.awards.map((award, index) => {
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
                      {award}
                    </Typography>
                  </Grid>
                );
              })}
            {eventResult.matches && eventResult.matches.length > 0 && (
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
                    {t('highest-score')}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="600" color="primary">
                  {Math.max(...eventResult.matches.map(m => m.score))}
                </Typography>
              </Grid>
            )}
            {eventResult.matches && eventResult.matches.length > 0 && eventResult.rank && (
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
                    {t('robot-game-rank')}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="600" color="primary">
                  {eventResult.rank}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Match Results */}
        {eventResult.matches && eventResult.matches.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight="700" mb={1}>
                {t('match-results')}
              </Typography>
              <Grid container spacing={2}>
                {eventResult.matches.map((match, index) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography variant="body1" fontWeight="600">
                      {t('match-number', { number: match.matchNumber })}
                    </Typography>
                    <Typography variant="h6" fontWeight="600" color="primary">
                      {match.score}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
