'use client';

import { useMemo } from 'react';
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
import {
  createMatchLoadedSubscription,
  createMatchUpdatedSubscription,
  createMatchParticipantUpdatedSubscription
} from './graphql/subscriptions';
import { FieldSchedule, ActiveMatchDisplay } from './components';

export default function FieldHeadQueuerPage() {
  const t = useTranslations('pages.field-head-queuer');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchUpdatedSubscription(currentDivision.id),
      createMatchParticipantUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData<
    QueryData,
    QueryVars,
    HeadQueuerData,
    { divisionId: string }
  >(GET_HEAD_QUEUER_DATA, { divisionId: currentDivision.id }, parseHeadQueuerData, subscriptions);

  const safeData = data ?? {
    matches: [],
    tables: [],
    activeMatch: null,
    loadedMatch: null
  };

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Stack spacing={3} sx={{ pt: 3 }}>
        {error && <Alert severity="error">{error.message}</Alert>}
        {!loading && !data && (
          <Alert severity="info">
            No data loaded yet. Check that the backend GraphQL server is running.
          </Alert>
        )}

        <ActiveMatchDisplay
          divisionId={currentDivision.id}
          activeMatch={safeData.activeMatch}
          loadedMatch={safeData.loadedMatch}
          loading={loading}
        />

        <FieldSchedule
          divisionId={currentDivision.id}
          matches={safeData.matches}
          tables={safeData.tables}
          loadedMatchId={safeData.loadedMatch?.id}
          loading={loading}
        />
      </Stack>
    </>
  );
}
