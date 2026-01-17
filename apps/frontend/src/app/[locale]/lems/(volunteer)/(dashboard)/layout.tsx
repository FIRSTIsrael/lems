'use client';

import { Container, Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useConnectionResetOnNavigation } from '../../../../../lib/graphql/use-connection-reset-on-navigation';
import { DesktopAppBar, DRAWER_WIDTH } from './components/desktop/app-bar';
import { MobileAppBar } from './components/mobile/app-bar';

export default function VolunteerDashboardLayout({ children }: { children: React.ReactNode }) {
  useConnectionResetOnNavigation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ResponsiveComponent
        desktop={<DesktopAppBar />}
        mobile={<MobileAppBar />}
        mobileBreakpoint="lg"
      />

      <Box component="main" flexGrow={1} sx={{ backgroundColor: '#fafafa', mt: { xs: 8, lg: 0 } }}>
        <Container
          maxWidth="xl"
          sx={{
            pt: 3,
            minHeight: '100vh',
            maxWidth: { xs: '100vw', lg: `calc(100vw - ${DRAWER_WIDTH}px)` },
            px: { xs: 2, md: 4 }
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
