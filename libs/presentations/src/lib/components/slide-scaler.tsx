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

  console.log(width, height);

  return (
    <Box
      ref={ref}
      {...props}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.sx
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: DEFAULT_HEIGHT,
          width: DEFAULT_WIDTH,
          transform: `scale(${Math.min(width / DEFAULT_WIDTH, height / DEFAULT_HEIGHT)})`
        }}
      >
        {children}
      </div>
    </Box>
  );
};
