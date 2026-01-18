'use client';

import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { Groups, Map, EmojiEvents, EventNote, Stadium, Schedule, Timer } from '@mui/icons-material';
import { PageHeader } from '../components/page-header';
import { ReportMenuGrid } from './components/report-menu-grid';

export default function ReportsPage() {
  const t = useTranslations('pages.reports');

  const reportItems = [
    { path: 'field-status', label: t('menu.field-status'), icon: <Stadium /> },
    { path: 'team-list', label: t('menu.team-list'), icon: <Groups /> },
    { path: 'pit-map', label: t('menu.pit-map'), icon: <Map /> },
    { path: 'awards-list', label: t('menu.awards-list'), icon: <EmojiEvents /> },
    { path: 'event-agenda', label: t('menu.event-agenda'), icon: <EventNote /> },
    { path: 'field-schedule', label: t('menu.field-schedule'), icon: <Stadium /> },
    { path: 'judging-schedule', label: t('menu.judging-schedule'), icon: <Schedule /> },
    { path: 'field-timer', label: t('menu.field-timer'), icon: <Timer /> },
    { path: 'judging-status', label: t('menu.judging-status'), icon: <Schedule /> }
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
