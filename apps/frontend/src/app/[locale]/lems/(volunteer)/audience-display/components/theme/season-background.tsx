'use client';

import { Box } from '@mui/material';
import { AUDIENCE_THEME } from './constants';

interface SeasonBackgroundProps {
  /** Include side trees (welcome / message / sponsors / awards). */
  withTrees?: boolean;
}

const absImg = (src: string, sx: Record<string, unknown>) => (
  <Box component="img" src={src} alt="" sx={{ position: 'absolute', ...sx }} />
);

export const SeasonBackground = ({ withTrees = false }: SeasonBackgroundProps) => {
  const { assets, skyGradient, grass } = AUDIENCE_THEME;

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
      <Box sx={{ position: 'absolute', left: 0, top: 858, width: 1920, height: 222, bgcolor: grass }} />

      {absImg(assets.bushLeft, { left: -140, top: 664, width: 480, height: 129, transform: 'scaleX(-1)' })}
      {absImg(assets.bushRight, { left: 1468, top: 679, width: 480, height: 129 })}

      {withTrees && (
        <>
          <Box
            sx={{
              position: 'absolute',
              left: -278,
              top: -93,
              width: 622,
              height: 888,
              overflow: 'hidden',
              transform: 'scaleX(-1)'
            }}
          >
            {absImg(assets.treeCanopy, { left: 35, top: 230, width: 494, height: 1065 })}
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: 1438,
              top: 7,
              width: 622,
              height: 888,
              overflow: 'hidden'
            }}
          >
            {absImg(assets.treeRightSmall, { left: 320, top: 319, width: 302, height: 771 })}
            {absImg(assets.treeCanopy, { left: 59, top: 0, width: 494, height: 1065 })}
          </Box>
        </>
      )}

      {absImg(assets.grass2, { left: 867, top: 668, width: 1094, height: 233 })}
      {absImg(assets.grass1, { left: -58, top: 644, width: 1094, height: 233 })}
    </Box>
  );
};
