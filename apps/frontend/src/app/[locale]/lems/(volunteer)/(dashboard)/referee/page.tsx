'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Box } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_REFEREE_DATA,
  parseRefereeData,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createTeamArrivedSubscription,
  createParticipantStatusUpdatedSubscription,
  createMatchLoadedSubscription,
  createMatchAbortedSubscription,
  createScoresheetStatusChangedSubscription,
  createMatchStageAdvancedSubscription
} from './graphql';
import { RefereeContent } from './components/referee-content';
import { RefereeProvider } from './components/referee-context';

export default function RefereePage() {
  const t = useTranslations('pages.referee');
  const { currentDivision } = useEvent();
  const user = useUser();

  const tableId = useMemo(() => {
    if (user.role === 'referee' && user.roleInfo?.tableId) {
      return user.roleInfo.tableId as string;
    }
    return '';
  }, [user]);

  const subscriptions = useMemo(
    () => [
      createTeamArrivedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createParticipantStatusUpdatedSubscription(currentDivision.id),
      createMatchLoadedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createScoresheetStatusChangedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_REFEREE_DATA,
    {
      divisionId: currentDivision.id,
      tableId
    },
    parseRefereeData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load referee data');
  }

  if (loading || !data || !tableId) {
    return (
      <>
        <PageHeader title={t('page-title', { table: tableId })} />
        <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
          <Box sx={{ animation: 'pulse 2s infinite' }}>Loading referee data...</Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('page-title', { table: tableId })} />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
        <RefereeProvider data={data}>
          <RefereeContent />
        </RefereeProvider>
      </Container>
    </>
  );
}
