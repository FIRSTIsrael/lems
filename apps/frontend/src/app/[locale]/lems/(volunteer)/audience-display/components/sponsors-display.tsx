'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import sponsorImages from '../../../../../../../public/assets/audience-display/sponsors';
import { AUDIENCE_THEME, firstTitleTags, SeasonBackground } from './theme';

const copySx = {
  m: 0,
  fontFamily: 'inherit',
  fontWeight: 700,
  lineHeight: 1.25,
  color: 'inherit',
  textAlign: 'center'
} as const;

export const SponsorsDisplay = () => {
  const t = useTranslations('pages.audience-display.sponsors');
  const { text, fontFamily } = AUDIENCE_THEME;
  const [index, setIndex] = useState(0);

  const sponsorsData = Object.keys(sponsorImages);

  useEffect(() => {
    if (sponsorsData.length <= 1) return;

    const interval = setInterval(() => {
      setIndex(prevIndex => (prevIndex + 1) % sponsorsData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsorsData.length]);

  const currentSponsor = useMemo(() => {
    if (sponsorsData.length === 0) return null;
    return sponsorImages[sponsorsData[index]] || null;
  }, [index, sponsorsData]);

  if (!currentSponsor) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <SeasonBackground withTrees layout="sponsors" />

      <Typography
        sx={{
          position: 'absolute',
          left: '50%',
          top: 176,
          zIndex: 1,
          width: 1435,
          transform: 'translateX(-50%)',
          color: text,
          fontFamily,
          fontSize: 64
        }}
      >
        <Box component="p" sx={copySx}>
          {t.rich('title', firstTitleTags)}
        </Box>
        <Box component="p" sx={copySx}>
          {t('subtitle')}
        </Box>
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 459,
          zIndex: 1,
          width: 923,
          height: 214,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          key={`sponsor-${index}`}
          src={currentSponsor}
          alt=""
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>
    </Box>
  );
};
