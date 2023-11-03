import { useRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import { useDimensions } from '../../hooks/use-dimensions';

export interface PresentationScalerProps extends BoxProps {
  children?: React.ReactNode;
}

export const PresentationScaler: React.FC<PresentationScalerProps> = ({ children, ...props }) => {
  const DEFAULT_WIDTH = 1920;
  const DEFAULT_HEIGHT = 1080;

  const ref = useRef(null);
  const { width, height } = useDimensions(ref);

  console.log(width);
  console.log(height);

  return (
    <Box ref={ref} {...props}>
      <div
        style={{
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          transform: `scale(${Math.min(width / DEFAULT_WIDTH, height / DEFAULT_HEIGHT)})`
        }}
      >
        {children}
      </div>
    </Box>
  );
};
