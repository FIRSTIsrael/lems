'use client';

import { useTranslations } from 'next-intl';
import { Container, Stack, Box, Typography } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_PIT_MAP, parsePitMapUrl } from './graphql';

export default function PitMapReportPage() {
  const t = useTranslations('pages.reports.pit-map');
  const { currentDivision } = useEvent();

  const {
    data: pitMapUrl,
    loading,
    error
  } = usePageData(GET_DIVISION_PIT_MAP, { divisionId: currentDivision.id }, parsePitMapUrl);

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {loading && <Typography color="text.secondary">{t('loading')}</Typography>}

          {error && !loading && <Typography color="error.main">{t('error-loading')}</Typography>}

          {!loading && !error && !pitMapUrl && (
            <Typography color="text.secondary">{t('no-map')}</Typography>
          )}

          {!loading && !error && pitMapUrl && (
            <Box
              component="img"
              src={pitMapUrl}
              alt={t('page-title')}
              sx={{
                mt: 2,
                display: 'block',
                width: 'auto',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                maxHeight: { xs: 400, md: 600 },
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
