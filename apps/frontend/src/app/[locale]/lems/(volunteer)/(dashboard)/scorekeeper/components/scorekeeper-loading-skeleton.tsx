'use client';

import { useTranslations } from 'next-intl';
import { Stack, Paper, Skeleton, Grid, Container } from '@mui/material';
import { PageHeader } from '../../components/page-header';

export function ScorekeeperLoadingSkeleton() {
  const t = useTranslations('pages.scorekeeper');

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        <Stack spacing={3}>
          {/* Audience Display Control Skeleton */}
          <Stack spacing={2}>
            <Skeleton variant="text" width="30%" height={28} />
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
            </Paper>
          </Stack>

          {/* Current and Next Match Skeletons */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="40%" height={28} />
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

            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="40%" height={28} />
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Stack spacing={2}>
                    <Skeleton variant="text" height={32} />
                    <Stack direction="row" spacing={2}>
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Stack>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {/* Control Buttons Skeleton */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 10, md: 8, lg: 6 }} sx={{ mx: { xs: 0, sm: 'auto' } }}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="30%" height={28} />
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Stack spacing={1.5}>
                    <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
                    <Stack direction="row" spacing={1.5}>
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        sx={{ borderRadius: 1, flex: 1 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        sx={{ borderRadius: 1, flex: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {/* Schedule Skeleton */}
          <Stack spacing={2}>
            <Skeleton variant="text" width="30%" height={28} />
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
      </Container>
    </>
  );
}
