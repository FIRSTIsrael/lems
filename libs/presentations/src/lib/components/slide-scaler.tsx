'use client';

import { useRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import { useDimensions } from '../hooks/use-dimensions';

export interface SlideScalerProps extends BoxProps {
  children?: React.ReactNode;
}

export const SlideScaler: React.FC<SlideScalerProps> = ({ children, ...props }) => {
  const DEFAULT_WIDTH = 1920;
  const DEFAULT_HEIGHT = 1080;

  const ref = useRef(null);
  const { width, height } = useDimensions(ref);

  return (
    <Box ref={ref} {...props} sx={{ width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: DEFAULT_HEIGHT,
          width: DEFAULT_WIDTH,
          transform: `scale(${Math.max(width / DEFAULT_WIDTH, height / DEFAULT_HEIGHT)})`,
          transformOrigin: 'top left'
        }}
      >
        {children}
      </div>
    </Box>
  );
};
