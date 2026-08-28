'use client';

import { Box, Typography } from '@mui/material';
import { useAudienceDisplay } from './audience-display-context';
import { AUDIENCE_THEME, HeroExplorer, SeasonBackground, SupporterLogos } from './theme';

const HERO_TRAP = { left: 1, top: 150, width: 447, height: 427 } as const;

export const MessageDisplay = () => {
  const { displayState } = useAudienceDisplay();
  const message = (displayState?.settings?.message?.value as string) || '';
  const { assets, forest, fontFamily } = AUDIENCE_THEME;
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

        <HeroExplorer trap={HERO_TRAP} explorerSrc={assets.messageExplorer} height={682} />

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
