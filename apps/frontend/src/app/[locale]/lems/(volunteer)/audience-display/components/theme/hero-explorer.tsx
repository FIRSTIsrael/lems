'use client';

import { Box } from '@mui/material';
import { AUDIENCE_THEME } from './constants';
import { getHeroMask, type HeroTrap } from './hero-mask';

interface HeroExplorerProps {
  trap: HeroTrap;
  explorerSrc: string;
  height: number;
}

export const HeroExplorer = ({ trap, explorerSrc, height }: HeroExplorerProps) => {
  const { assets } = AUDIENCE_THEME;
  const { trapMask, explorerMask, topUnmaskH, heroBaseTop, heroBaseMaskPosition } = getHeroMask(
    trap,
    assets.heroPattern
  );

  return (
    <>
      <Box component="img" src={assets.heroPattern} alt="" sx={{ position: 'absolute', ...trap }} />

      <Box
        component="img"
        src={assets.heroBase}
        alt=""
        sx={{
          position: 'absolute',
          left: -6,
          top: heroBaseTop,
          width: 461,
          height: 195,
          WebkitMaskImage: trapMask,
          maskImage: trapMask,
          WebkitMaskSize: `${trap.width}px ${trap.height}px`,
          maskSize: `${trap.width}px ${trap.height}px`,
          WebkitMaskPosition: heroBaseMaskPosition,
          maskPosition: heroBaseMaskPosition,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          pointerEvents: 'none'
        }}
      />

      <Box
        component="img"
        src={explorerSrc}
        alt=""
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 471,
          height,
          objectFit: 'contain',
          objectPosition: 'top center',
          pointerEvents: 'none',
          WebkitMaskImage: explorerMask,
          maskImage: explorerMask,
          WebkitMaskSize: `100% ${topUnmaskH}px, ${trap.width}px ${trap.height}px`,
          maskSize: `100% ${topUnmaskH}px, ${trap.width}px ${trap.height}px`,
          WebkitMaskPosition: `0 0, ${trap.left}px ${trap.top}px`,
          maskPosition: `0 0, ${trap.left}px ${trap.top}px`,
          WebkitMaskRepeat: 'no-repeat, no-repeat',
          maskRepeat: 'no-repeat, no-repeat',
          WebkitMaskComposite: 'source-over',
          maskComposite: 'add'
        }}
      />
    </>
  );
};
