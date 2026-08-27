'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../components/event-context';
import { AUDIENCE_THEME, SeasonBackground, SupporterLogos } from './theme';

interface WelcomeDisplayProps {
  teamCount: number;
}

const TRAP = { left: 1, top: 151, width: 447, height: 427 } as const;
const TOP_UNMASK_H = TRAP.top + 160;

const copySx = {
  m: 0,
  fontFamily: 'inherit',
  fontWeight: 700,
  lineHeight: 1.25,
  color: 'inherit'
} as const;

export const WelcomeDisplay = ({ teamCount }: WelcomeDisplayProps) => {
  const t = useTranslations('pages.audience-display.welcome');
  const { eventName, eventLocation } = useEvent();
  const { assets, text, forest, badgeBg, fontFamily } = AUDIENCE_THEME;

  const trapMask = `url(${assets.heroPattern})`;
  const explorerMask = `linear-gradient(#000, #000), ${trapMask}`;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <SeasonBackground withTrees />

      <Box sx={{ position: 'absolute', left: 361, top: -36, width: 1198, height: 724, zIndex: 1 }}>
        <Box
          component="img"
          src={assets.heroPattern}
          alt=""
          sx={{ position: 'absolute', ...TRAP }}
        />

        <Box
          component="img"
          src={assets.heroBase}
          alt=""
          sx={{
            position: 'absolute',
            left: -6,
            top: 437,
            width: 461,
            height: 195,
            WebkitMaskImage: trapMask,
            maskImage: trapMask,
            WebkitMaskSize: `${TRAP.width}px ${TRAP.height}px`,
            maskSize: `${TRAP.width}px ${TRAP.height}px`,
            WebkitMaskPosition: `7px -286px`,
            maskPosition: `7px -286px`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            pointerEvents: 'none'
          }}
        />

        <Box
          component="img"
          src={assets.explorer}
          alt=""
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 471,
            height: 724,
            objectFit: 'contain',
            objectPosition: 'top center',
            pointerEvents: 'none',
            WebkitMaskImage: explorerMask,
            maskImage: explorerMask,
            WebkitMaskSize: `100% ${TOP_UNMASK_H}px, ${TRAP.width}px ${TRAP.height}px`,
            maskSize: `100% ${TOP_UNMASK_H}px, ${TRAP.width}px ${TRAP.height}px`,
            WebkitMaskPosition: `0 0, ${TRAP.left}px ${TRAP.top}px`,
            maskPosition: `0 0, ${TRAP.left}px ${TRAP.top}px`,
            WebkitMaskRepeat: 'no-repeat, no-repeat',
            maskRepeat: 'no-repeat, no-repeat',
            WebkitMaskComposite: 'source-over',
            maskComposite: 'add'
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            left: 557,
            top: 294,
            color: text,
            fontFamily,
            fontWeight: 700,
            lineHeight: 1.25,
            maxWidth: 640
          }}
        >
          <Typography component="p" sx={{ ...copySx, fontSize: 35 }}>
            {t('headline')}
          </Typography>
          <Typography component="p" sx={{ ...copySx, fontSize: 72 }}>
            {eventName}
          </Typography>
          {eventLocation ? (
            <Typography component="p" sx={{ ...copySx, fontSize: 72 }}>
              {eventLocation}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            left: 382,
            top: 517,
            width: 173,
            height: 97,
            bgcolor: badgeBg,
            borderRadius: '13px',
            px: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0px 18px 32px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}
        >
          <Box
            sx={{
              width: 66,
              height: 66,
              flexShrink: 0,
              borderRadius: '13px',
              bgcolor: forest,
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <Box component="img" src={assets.usersFour} alt="" sx={{ width: 40, height: 40 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Typography sx={{ fontFamily, fontWeight: 700, fontSize: 16, lineHeight: 1.15, color: forest }}>
              {t('teams-label')}
            </Typography>
            <Typography sx={{ fontFamily, fontWeight: 700, fontSize: 28, lineHeight: 1.15, color: forest }}>
              {teamCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <SupporterLogos />
    </Box>
  );
};
