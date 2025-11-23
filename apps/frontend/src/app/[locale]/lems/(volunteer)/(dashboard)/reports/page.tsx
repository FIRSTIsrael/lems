'use client';

import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { Groups, Map } from '@mui/icons-material';
import { PageHeader } from '../components/page-header';
import { ReportMenuGrid } from './components/report-menu-grid';

export default function ReportsPage() {
  const t = useTranslations('pages.reports');

  const reportItems = [
    { path: 'team-list', label: t('menu.team-list'), icon: <Groups /> },
    { path: 'pit-map', label: t('menu.pit-map'), icon: <Map /> }
  ];

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
          <ReportMenuGrid items={reportItems} />
        </Box>
      </Stack>
    </Container>
  );
}
