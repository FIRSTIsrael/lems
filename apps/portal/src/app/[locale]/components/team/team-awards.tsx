'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

interface TeamAwardsProps {
  awards?: string[];
}

export const TeamAwards: React.FC<TeamAwardsProps> = ({ awards }) => {
  const t = useTranslations('pages.team');

  if (!awards || awards.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        {t('results.awards-title')}
      </Typography>
      <Stack spacing={1}>
        {awards.map((award, index) => (
          <Typography key={index} variant="body2" sx={{ pl: 2 }}>
            • {award}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};
