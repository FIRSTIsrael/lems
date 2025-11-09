'use client';

import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { Box, Container } from '@mui/material';
import { TeamSummary } from '@lems/types/api/portal';
import { TeamHeader } from './components/team-header';
import { TeamResults } from './components/team-results';
import { TeamContents } from './components/team-contents';
import { TeamProvider } from './components/team-context';

export default function TeamPage() {
  const params = useParams();
  const teamNumber =
    params.number && typeof params.number === 'string' ? parseInt(params.number, 10) : null;

  const { data: team, error } = useSWR<TeamSummary | null>(
    teamNumber ? `/portal/teams/${teamNumber}/summary` : null,
    {
      suspense: true,
      fallbackData: null
    }
  );

  if (error) throw new Error('Failed to load team data.');

  // Should never happen due to the suspense option
  if (!team) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <TeamProvider value={team}>
            <TeamContents />

            <Box sx={{ flex: 1 }}>
              <TeamHeader />
              <TeamResults />
            </Box>
          </TeamProvider>
        </Box>
      </Container>
    </Box>
  );
}
