'use client';

import { Container, Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { DesktopAppBar } from './components/desktop/app-bar';
import { MobileAppBar } from './components/mobile/app-bar';

export default function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ResponsiveComponent
        desktop={<DesktopAppBar />}
        mobile={<MobileAppBar />}
        mobileBreakpoint="lg"
      />

      <Box component="main" flexGrow={1} sx={{ backgroundColor: '#fafafa', mt: { xs: 8, lg: 0 } }}>
        <Container maxWidth="lg" sx={{ pt: 3, minHeight: '100vh' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
