'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface TeamAwardsProps {
  awards?: string[];
}

export const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
  const t = useTranslations('pages.team');

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
    return '#FFA500'; // Default? maybe should be none?
  };

  if (!awards || awards.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        {t('results.awards-title')}
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
        {awards.map((award, index) => {
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
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{award}</Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
