'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

interface ExportLayoutProps {
  children: ReactNode;
}

/**
 * Export Layout
 *
 * This layout is for the export functionality (rubrics, scoresheets, etc.)
 * It's currently accessible to everyone, but provides a boilerplate
 * for implementing authentication in the future.
 *
 * TODO: Implement export auth:
 * - [ ] Add token-based authentication
 * - [ ] Implement rate limiting
 * - [ ] Add time-based access tokens
 * - [ ] Add IP-based restrictions (optional)
 */
export default function ExportLayout({ children }: ExportLayoutProps) {
  // TODO: Add authentication check here
  // const { isAuthorized } = useExportAuth();
  // if (!isAuthorized) {
  //   return <UnauthorizedPage />;
  // }

  return (
    <Box
      component="main"
      sx={{
        py: 2,
        '@media print': {
          py: 0,
          px: 0
        }
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          '@media print': {
            maxWidth: '100%',
            px: 0,
            py: 0
          }
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
