'use client';

import useSWR from 'swr';
import { Box, Container, Grid } from '@mui/material';
import { Season } from '@lems/types/api/portal';
import { Hero } from './components/homepage/hero';
import { SearchSection } from './components/homepage/search-section';

export default function HomePage() {
  const { data: latestSeason } = useSWR<Season | null>('/portal/seasons/latest', {
    suspense: true,
    fallbackData: null
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero season={latestSeason} />

      <Container maxWidth="lg">
        <Grid container my={3}>
          <Grid size={12}>
            <SearchSection />
          </Grid>
        </Grid>
      </Container>

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
