'use client';

import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { Groups } from '@mui/icons-material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from './components/page-header';
import { ReportMenuGrid } from './components/report-menu-grid';

export default function ReportsPage() {
  const t = useTranslations('pages.reports');
  const { currentDivision } = useEvent();

  const reportItems = [{ path: 'team-list', label: t('menu.team-list'), icon: <Groups /> }];

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <ReportMenuGrid items={reportItems} divisionId={currentDivision.id} />
        </Box>
      </Stack>
    </Container>
  );
}
