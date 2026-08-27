'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AUDIENCE_THEME } from './constants';

const LOGOS = [
  { src: 'firstIsrael', alt: 'FIRST Israel', maxWidth: 221 },
  { src: 'technion', alt: 'Technion', maxWidth: 176 },
  { src: 'legoEducation', alt: 'LEGO Education', maxWidth: 277 },
  { src: 'joshWeston', alt: 'Mr. Josh Weston', maxWidth: 248 },
  { src: 'ministryEducation', alt: 'Ministry of Education', maxWidth: 193 },
  { src: 'ministryScience', alt: 'Ministry of Science', maxWidth: 229 }
] as const;

export const SupporterLogos = () => {
  const t = useTranslations('pages.audience-display.welcome');
  const { assets, fontFamily } = AUDIENCE_THEME;

  return (
    <>
      <Typography
        sx={{
          position: 'absolute',
          left: 54,
          top: 914,
          zIndex: 2,
          color: '#fff',
          fontFamily,
          fontWeight: 700,
          fontSize: 35,
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
      >
        {t('event-supporters')}
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          left: 63,
          top: 976,
          width: 1795,
          height: 60,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        {LOGOS.map(logo => (
          <Box
            key={logo.src}
            component="img"
            src={assets[logo.src]}
            alt={logo.alt}
            sx={{ height: 60, width: 'auto', maxWidth: logo.maxWidth }}
          />
        ))}
      </Box>
    </>
  );
};
