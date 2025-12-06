'use client';

import { Stack, Paper, Skeleton, Grid, Typography } from '@mui/material';

export function ScorekeeperLoadingSkeleton() {
  return (
    <>
      <Stack spacing={3}>
        {/* Top Row: Audience Display + Controls */}
        <Grid container spacing={3}>
          {/* Audience Display Control */}
          <Grid size={{ lg: 12, xl: 6 }}>
            <Stack spacing={2} height="100%">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                <Skeleton variant="text" width="40%" />
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
              </Paper>
            </Stack>
          </Grid>

          {/* Control Buttons */}
          <Grid size={{ lg: 12, xl: 6 }}>
            <Stack spacing={2} height="100%">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                <Skeleton variant="text" width="40%" />
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Second Row: Current Match + Next Match */}
        <Grid container spacing={3}>
          {/* Current Match */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                <Skeleton variant="text" width="40%" />
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Stack spacing={2}>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="rectangular" height={12} sx={{ borderRadius: 1 }} />
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Stack>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Next Match */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                <Skeleton variant="text" width="40%" />
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Stack spacing={2}>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="rectangular" height={12} sx={{ borderRadius: 1 }} />
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Stack>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Schedule */}
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
            <Skeleton variant="text" width="30%" />
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    </>
  );
}
