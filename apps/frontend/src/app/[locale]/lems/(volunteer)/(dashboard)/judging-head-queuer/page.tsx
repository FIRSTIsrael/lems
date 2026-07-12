'use client';

import { useTranslations } from 'next-intl';
import { Stack, Alert } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_HEAD_QUEUER_DATA,
  parseHeadQueuerData,
  type HeadQueuerData,
  type QueryData,
  type QueryVars
} from './graphql/index';
import { JudgingSchedule, CurrentSessionsDisplay } from './components';

export default function JudgingHeadQueuerPage() {
  const t = useTranslations('pages.judging-head-queuer');
  const { currentDivision } = useEvent();

  const { data, loading, error } = usePageData<
    QueryData,
    QueryVars,
    HeadQueuerData,
    { divisionId: string }
  >(GET_HEAD_QUEUER_DATA, { divisionId: currentDivision.id }, parseHeadQueuerData);

  const safeData = data ?? {
    sessions: [],
    rooms: [],
    currentSessions: [],
    upcomingSessions: []
  };

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Stack spacing={3} sx={{ pt: 3 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        {!loading && !data && <Alert severity="info">{t('no-data')}</Alert>}

        <CurrentSessionsDisplay
          divisionId={currentDivision.id}
          currentSessions={safeData.currentSessions}
          upcomingSessions={safeData.upcomingSessions}
          loading={loading}
        />

        <JudgingSchedule
          divisionId={currentDivision.id}
          sessions={safeData.sessions}
          rooms={safeData.rooms}
          loading={loading}
        />
      </Stack>
    </>
  );
}
