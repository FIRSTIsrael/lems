'use client';

import { Box, Typography } from '@mui/material';
import { useAudienceDisplay } from './audience-display-context';
import { AUDIENCE_THEME, SeasonBackground, SupporterLogos } from './theme';

const TRAP = { left: 1, top: 150, width: 447, height: 427 } as const;
const TOP_UNMASK_H = TRAP.top + 160;

export const MessageDisplay = () => {
  const { displayState } = useAudienceDisplay();
  const message = (displayState?.settings?.message?.value as string) || '';
  const { assets, forest, fontFamily } = AUDIENCE_THEME;

  const trapMask = `url(${assets.heroPattern})`;
  const explorerMask = `linear-gradient(#000, #000), ${trapMask}`;
  const lines = message.split('\n').filter(line => line.length > 0);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <SeasonBackground withTrees />

      <Box sx={{ position: 'absolute', left: 316, top: 40, width: 1289, height: 682, zIndex: 1 }}>
        <Box
          component="img"
          src={assets.messagePanel}
          alt=""
          sx={{
            position: 'absolute',
            left: 249,
            top: 205,
            width: 1040,
            height: 372,
            transform: 'scaleY(-1) rotate(180deg)'
          }}
        />

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
            WebkitMaskPosition: `7px -287px`,
            maskPosition: `7px -287px`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            pointerEvents: 'none'
          }}
        />

        <Box
          component="img"
          src={assets.messageExplorer}
          alt=""
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 471,
            height: 682,
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
            left: 488,
            top: 300,
            width: 726,
            color: forest,
            fontFamily,
            fontWeight: 700,
            fontSize: 62,
            lineHeight: 1.25
          }}
        >
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <Typography key={index} component="p" sx={{ m: 0, font: 'inherit', color: 'inherit' }}>
                {line}
              </Typography>
            ))
          ) : (
            <Typography component="p" sx={{ m: 0, font: 'inherit', color: 'inherit', opacity: 0.5 }}>
              &nbsp;
            </Typography>
          )}
        </Box>
      </Box>

      <SupporterLogos />
    </Box>
  );
};
