'use client';

import { useTranslations } from 'next-intl';
import { Container, Stack, Box } from '@mui/material';
import { PageHeader } from '../../components/page-header';

export default function PitMapReportPage() {
  const t = useTranslations('pages.reports.pit-map');

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {/* No data */}
        </Box>
      </Stack>
    </Container>
  );
}
