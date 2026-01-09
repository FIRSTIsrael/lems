'use client';

import { Skeleton, Container, Stack, Box } from '@mui/material';

export function LoadingSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
      <Stack spacing={3}>
        <Skeleton variant="rectangular" width="100%" height={60} />
        <Skeleton variant="rectangular" width="100%" height={120} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Stack>
    </Container>
  );
}
