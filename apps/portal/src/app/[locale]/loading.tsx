'use client';

import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        py: 6
      }}
    >
      <CircularProgress size={80} thickness={5} />
    </Box>
  );
}
