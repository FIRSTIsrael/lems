'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { useUser } from '../components/user-context';
import { authorizeUserRole } from '../../lib/role-authorizer';
import { useWindowSize } from '../hooks/use-window-size';

export default function AudienceDisplayLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const screenSize = useWindowSize();

  const displayScale = useMemo(() => {
    const widthScale = screenSize.width / 1920;
    const heightScale = screenSize.height / 1080;
    return Math.min(widthScale, heightScale);
  }, [screenSize]);

  const authorized = authorizeUserRole(user, 'audience-display');
  if (!authorized) return null;

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
}
