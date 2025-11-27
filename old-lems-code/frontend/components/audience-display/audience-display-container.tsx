import { Box } from '@mui/material';
import { useWindowSize } from '../../hooks/layout/use-window-size';
import { useMemo } from 'react';

interface AudienceDisplayContainerProps {
  children?: React.ReactNode;
}

const AudienceDisplayContainer: React.FC<AudienceDisplayContainerProps> = ({ children }) => {
  const screenSize = useWindowSize();

  const displayScale = useMemo(() => {
    const widthScale = screenSize.width / 1920;
    const heightScale = screenSize.height / 1080;
    return Math.min(widthScale, heightScale);
  }, [screenSize]);

  return (
    <Box sx={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Box
        sx={{
          width: 1920,
          height: 1080,
          position: 'absolute',
          transformOrigin: 'top left',
          transformStyle: 'preserve-3d',
          transform: `scale(${displayScale}) translate(-50%,-50%)`,
          left: '50%',
          top: '50%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AudienceDisplayContainer;
