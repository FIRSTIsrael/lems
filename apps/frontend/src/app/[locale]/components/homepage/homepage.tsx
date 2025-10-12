'use client';

import { Box, Container } from '@mui/material';
import { Hero } from './hero';
import { LiveEventsSection } from './live-events-section';
import { UpcomingEventsSection } from './upcoming-events-section';

export const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <LiveEventsSection />
        <UpcomingEventsSection />
      </Container>
    </Box>
  );
};
