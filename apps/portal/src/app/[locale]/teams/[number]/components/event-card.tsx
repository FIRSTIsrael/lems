'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Chip, Divider } from '@mui/material';
import { TrendingUp as ScoreIcon, EmojiEvents } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { EventResult } from './mockTeamData';

interface EventCardProps {
  eventResult: EventResult;
}

export const EventCard: React.FC<EventCardProps> = ({ eventResult }) => {
  const t = useTranslations('pages.team.events');
  const getRankColor = (rank?: number) => {
    if (!rank) return 'default';
    if (rank === 1) return 'warning';
    if (rank === 2) return 'info';
    if (rank === 3) return 'success';
    return 'default';
  };

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
  // wifi delete this when there will be actual data
  const getSeasonName = (year: number) => {
    const seasonNames: { [key: number]: string } = {
      2025: 'SUBMERGED℠',
      2024: 'MASTERPIECE℠',
      2023: 'SUPERPOWERED℠',
      2022: 'CARGO CONNECT℠',
      2021: 'REPLAY℠',
      2020: 'CITY SHAPER℠',
      2019: 'INTO ORBIT℠',
      2018: 'HYDRO DYNAMICS℠'
    };
    return seasonNames[year] || `${year} Season`;
  };

  return (
    <Card
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="600" color="primary">
              {eventResult.eventName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getSeasonName(eventResult.year)}
            </Typography>
          </Box>
          {eventResult.matches && eventResult.matches.length > 0 && eventResult.rank && (
            <Chip
              label={t('robot-game-rank', { rank: eventResult.rank })}
              color={getRankColor(eventResult.rank)}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        {/* Awards Section */}
        {eventResult.awards && eventResult.awards.length > 0 && (
          <Box mb={2}>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2, color: 'text.primary' }}>
              {t('awards')}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              {eventResult.awards.map((award, index) => {
                const trophyColor = getAwardIcon(award);
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1,
                      px: 2,
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
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Best Match Score Section */}
        {eventResult.matches && eventResult.matches.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              {/* Best Score Display */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  mb: 2
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ScoreIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight="500">
                    {t('highest-score')}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight="600" color="primary">
                  {Math.max(...eventResult.matches.map(m => m.score))}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {/* Match Results */}
        {eventResult.matches && eventResult.matches.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="600" mb={1}>
                {t('match-results')}
              </Typography>
              <Stack spacing={1}>
                {eventResult.matches.map((match, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}
                  >
                    <Typography variant="body2" fontWeight="500">
                      {t('match-number', { number: match.matchNumber })}
                    </Typography>
                    <Typography variant="h6" fontWeight="600" color="primary">
                      {match.score}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
