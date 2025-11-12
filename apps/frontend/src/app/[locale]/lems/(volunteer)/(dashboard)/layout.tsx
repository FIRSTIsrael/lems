'use client';

import { Container, Box } from '@mui/material';
import { DesktopAppBar } from './components/desktop/app-bar';
import { MobileAppBar } from './components/mobile/app-bar';

export default function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box display={{ xs: 'none', lg: 'block' }}>
        <DesktopAppBar />
      </Box>

      <Box display={{ xs: 'block', lg: 'none' }}>
        <MobileAppBar />
      </Box>

      <Box component="main" flexGrow={1} sx={{ backgroundColor: '#fafafa', mt: { xs: 8, lg: 0 } }}>
        <Container maxWidth="lg" sx={{ pt: 3, minHeight: '100vh' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
