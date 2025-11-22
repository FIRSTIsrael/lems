'use client';

import { Paper, Box, Skeleton, Stack, useTheme, useMediaQuery } from '@mui/material';

export const LoadingTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Skeleton variant="text" width="30%" height={40} />
      </Box>

      <Stack spacing={3} mt={2}>
        <Paper sx={{ p: 0, bgcolor: 'white' }}>
          <Box sx={{ p: 2 }}>
            {/* Header skeleton */}
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />

            {/* Table header skeleton */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {Array.from({ length: isMobile ? 3 : 5 }).map((_, col) => (
                <Box key={col} sx={{ flex: 1 }}>
                  <Skeleton variant="text" height={24} />
                </Box>
              ))}
            </Box>

            {/* Table rows skeleton */}
            {[1, 2, 3, 4].map(row => (
              <Box key={row} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                {[1, 2, 3, 4, 5].map(col => (
                  <Box key={col} sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={20} />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
};
