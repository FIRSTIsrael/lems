'use client';

import useSWR from 'swr';
import { Box, Container, Grid, Stack } from '@mui/material';
import { Season } from '@lems/types/api/portal';
import { Hero } from './components/homepage/hero';
import { SearchSection } from './components/homepage/search/search-section';
import { ActiveEventsSection } from './components/homepage/active-events-section';
import { QuickActionsSection } from './components/homepage/quick-actions-section';
import { ResourceLinksSection } from './components/homepage/resource-links-section';

export default function HomePage() {
  const { data: latestSeason } = useSWR<Season | null>('/portal/seasons/latest', {
    suspense: true,
    fallbackData: null
  });

  if (!latestSeason) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero season={latestSeason} />

      <Container maxWidth="lg">
        <Grid container my={3} spacing={{ xs: 2, sm: 3 }}>
          <Grid size={12}>
            <SearchSection />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <ActiveEventsSection />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={{ xs: 2, sm: 3 }}>
              <QuickActionsSection />
              <ResourceLinksSection />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
