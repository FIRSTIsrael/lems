'use client';

import { useEffect } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard segment error:', error);
  }, [error]);

  return (
    <Box sx={{ py: 6 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4">Something went wrong</Typography>
        <Alert severity="error">{error.message || 'Unexpected error'}</Alert>
        <Button variant="outlined" onClick={reset}>
          Try again
        </Button>
      </Stack>
    </Box>
  );
}
