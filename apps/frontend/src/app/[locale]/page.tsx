import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { Box, Container } from '@mui/material';
import { Hero } from './components/homepage/hero';
import { LiveEventsSection } from './components/homepage/live-events-section';
import { UpcomingEventsSection } from './components/homepage/upcoming-events-section';

export default async function Page() {
  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    redirect(`/lems`);
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Hero />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <LiveEventsSection />
        <UpcomingEventsSection />
      </Container>
    </Box>
  );
}
