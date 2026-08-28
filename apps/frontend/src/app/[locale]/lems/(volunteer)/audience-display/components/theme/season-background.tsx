'use client';

import { Box } from '@mui/material';
import { AUDIENCE_THEME } from './constants';

type SeasonLayout = 'default' | 'sponsors';

interface SeasonBackgroundProps {
  withTrees?: boolean;
  layout?: SeasonLayout;
}

type Pos = { left: number; top: number };
type Rect = Pos & { width: number; height: number };

const SIZES = {
  bush: { width: 480, height: 129 },
  grass: { width: 1094, height: 233 },
  treeFrame: { width: 622, height: 888 }
} as const;

/** Screen-absolute Figma coordinates (Grass frame uses display:contents in export). */
const LAYOUTS: Record<
  SeasonLayout,
  {
    footer?: Rect;
    bushLeft: Pos;
    bushRight: Pos;
    leftTree: Pos;
    rightTree: Pos;
    grass1: Pos;
    grass2: Pos;
  }
> = {
  default: {
    footer: { left: 0, top: 858, width: 1920, height: 222 },
    bushLeft: { left: -140, top: 664 },
    bushRight: { left: 1468, top: 679 },
    leftTree: { left: -278, top: -93 },
    rightTree: { left: 1438, top: 7 },
    grass1: { left: -58, top: 644 },
    grass2: { left: 867, top: 668 }
  },
  sponsors: {
    footer: { left: -14, top: 1011, width: 1963, height: 87 },
    bushLeft: { left: -140, top: 844 },
    bushRight: { left: 1468, top: 859 },
    leftTree: { left: -278, top: 87 },
    rightTree: { left: 1458, top: 237 },
    grass1: { left: -58, top: 824 },
    grass2: { left: 867, top: 848 }
  }
};

const absImg = (src: string, sx: Record<string, unknown>) => (
  <Box component="img" src={src} alt="" sx={{ position: 'absolute', display: 'block', ...sx }} />
);

export const SeasonBackground = ({ withTrees = false, layout = 'default' }: SeasonBackgroundProps) => {
  const { assets, skyGradient, grass } = AUDIENCE_THEME;
  const frame = LAYOUTS[layout];

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundImage: skyGradient,
        pointerEvents: 'none'
      }}
    >
      {frame.footer && <Box sx={{ position: 'absolute', ...frame.footer, bgcolor: grass }} />}

      {absImg(assets.bushLeft, {
        ...frame.bushLeft,
        width: SIZES.bush.width,
        height: SIZES.bush.height,
        transform: 'scaleX(-1)'
      })}
      {absImg(assets.bushRight, {
        ...frame.bushRight,
        width: SIZES.bush.width,
        height: SIZES.bush.height
      })}

      {withTrees && (
        <>
          <Box
            sx={{
              position: 'absolute',
              ...frame.leftTree,
              width: SIZES.treeFrame.width,
              height: SIZES.treeFrame.height,
              overflow: 'hidden',
              transform: 'scaleX(-1)'
            }}
          >
            {absImg(assets.treeCanopy, { left: 35, top: 230, width: 494, height: 1065 })}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              ...frame.rightTree,
              width: SIZES.treeFrame.width,
              height: SIZES.treeFrame.height,
              overflow: 'hidden'
            }}
          >
            {absImg(assets.treeRightSmall, { left: 320, top: 319, width: 302, height: 771 })}
            {absImg(assets.treeCanopy, { left: 59, top: 0, width: 494, height: 1065 })}
          </Box>
        </>
      )}

      {absImg(assets.grass2, {
        ...frame.grass2,
        width: SIZES.grass.width,
        height: SIZES.grass.height
      })}
      {absImg(assets.grass1, {
        ...frame.grass1,
        width: SIZES.grass.width,
        height: SIZES.grass.height
      })}
    </Box>
  );
};
