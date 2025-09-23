'use client';

import { Box } from '@mui/material';
import { Hero } from './components/homepage/hero';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero />

      {/* <SearchSection /> */}

      {/* Main Content */}
      {/* <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ActiveEventsSection events={mockEvents} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <QuickActionsSection actions={quickActions} />
              <ResourceLinksSection resources={resourceLinks} />
            </Stack>
          </Grid>
        </Grid>
      </Container> */}
    </Box>
  );
}
