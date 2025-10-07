'use client';

import React from 'react';
import { Stack } from '@mui/material';
import { WinnerBanner } from './winner-banner';

interface WinnerBannersProps {
  isChampion: boolean;
}

export const WinnerBanners: React.FC<WinnerBannersProps> = ({ isChampion }) => {
  if (!isChampion) return null;

  const banners = [
    { year: '2025', competition: 'ISR #1 DISTRICT' },
    { year: '2025', competition: 'ISR #3 DISTRICT' },
    { year: '2025', competition: 'ISRAEL CHAMPIONSHIP' },
    { year: '2025', competition: 'JOHNSON DIVISION' }
  ];

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
      {banners.map((banner, index) => (
        <WinnerBanner
          key={index}
          year={banner.year}
          competition={banner.competition}
        />
      ))}
    </Stack>
  );
};
