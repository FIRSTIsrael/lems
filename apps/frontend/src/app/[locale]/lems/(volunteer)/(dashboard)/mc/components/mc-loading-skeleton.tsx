'use client';

import { Stack, Skeleton, Paper, Box } from '@mui/material';

export const McLoadingSkeleton: React.FC = () => {
  return (
    <Stack spacing={3}>
      {/* Current Match Hero Skeleton */}
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={200} height={50} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" width="50%" height={150} />
            <Skeleton variant="rectangular" width="50%" height={150} />
          </Stack>
        </Stack>
      </Paper>

      {/* Schedule Table Skeleton */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Box>
      </Paper>

      {/* Awards Placeholder Skeleton */}
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="circular" width={80} height={80} />
          <Skeleton variant="text" width={250} height={32} />
          <Skeleton variant="text" width={400} height={20} />
        </Stack>
      </Paper>
    </Stack>
  );
};
