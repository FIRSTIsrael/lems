'use client';

import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { DesktopAppBar } from './components/desktop-app-bar';
import { MobileAppBar } from './components/mobile-app-bar';

export default function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isDesktop ? <DesktopAppBar /> : <MobileAppBar />}

      <Box component="main" flexGrow={1} sx={{ backgroundColor: '#fafafa', mt: isDesktop ? 0 : 8 }}>
        <Container maxWidth="lg" sx={{ pt: 3, minHeight: '100vh' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
