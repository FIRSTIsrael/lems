'use client';

import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_DIVISION_AGENDA, parseDivisionAgenda } from './graphql';
import { AgendaEventsList } from './components/agenda-events-list';
import { ErrorState } from './components/error-state';
import { EmptyState } from './components/empty-state';
import { LoadingState } from './components/loading-state';

export default function EventAgendaPage() {
  const t = useTranslations('pages.reports.event-agenda');
  const { currentDivision } = useEvent();

  const {
    data: events = [],
    loading,
    error
  } = usePageData(GET_DIVISION_AGENDA, { divisionId: currentDivision.id }, parseDivisionAgenda);

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
          <Stack spacing={3}>
            {error && <ErrorState />}

            {!error && events.length === 0 && !loading && <EmptyState />}

            {!error && events.length > 0 && <AgendaEventsList events={events} />}

            {loading && <LoadingState />}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
