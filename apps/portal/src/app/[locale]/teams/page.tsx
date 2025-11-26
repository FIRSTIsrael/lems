import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Box, Container, Typography } from '@mui/material';
import { RichText } from '@lems/localization';
import { TeamList } from './components/team-list';

export default async function TeamsPage() {
  const t = await getTranslations('pages.teams');
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="bold"
          sx={{
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
          }}
        >
          {<RichText>{tags => t.rich('title', tags)}</RichText>}
        </Typography>

        <TeamList />
      </Container>
    </Box>
  );
}
