'use client';

import { useTranslations } from 'next-intl';
import { Paper, Box, Typography, Skeleton } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_PIT_MAP, parsePitMapUrl } from '../../reports/pit-map/graphql';

export function PitMapView() {
  const t = useTranslations('pages.field-queuer.pit-map');
  const { currentDivision } = useEvent();

  const {
    data: pitMapUrl,
    loading,
    error
  } = usePageData(GET_DIVISION_PIT_MAP, { divisionId: currentDivision.id }, parsePitMapUrl);

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (error || !pitMapUrl) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {error ? t('error') : t('no-map')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: { xs: 1, sm: 2 },
        pb: 2
      }}
    >
      <Box sx={{ width: '100%', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      <Box
        component="img"
        src={pitMapUrl}
        alt={t('title')}
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          objectFit: 'contain',
          borderRadius: 2,
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper'
        }}
      />
    </Box>
  );
}
