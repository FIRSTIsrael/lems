import React from 'react';
import { Box, Container } from '@mui/material';
import { TeamList } from './components/team-list';
import { TeamsPageHeader } from './components/teams-page-header';

export default async function TeamsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <TeamsPageHeader />
        <TeamList />
      </Container>
    </Box>
  );
}
