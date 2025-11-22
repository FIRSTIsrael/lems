'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Box } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_ROOM_JUDGING_SESSIONS,
  createTeamArrivalSubscriptionForJudge,
  createJudgingSessionStartedSubscriptionForJudge,
  START_JUDGING_SESSION_MUTATION
} from './judge.graphql';
import { RoomScheduleTable } from './components/room-schedule-table';

export default function JudgePage() {
  const t = useTranslations('pages.judge');

  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();
  const [startSessionMutation] = useMutation(START_JUDGING_SESSION_MUTATION, {
    onError: () => {
      toast.error(t('error'));
    }
  });

  const subscriptions = useMemo(
    () => [
      createTeamArrivalSubscriptionForJudge(currentDivision.id),
      createJudgingSessionStartedSubscriptionForJudge(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_ROOM_JUDGING_SESSIONS,
    {
      divisionId: currentDivision.id,
      roomId: roleInfo?.['roomId']
    },
    undefined,
    subscriptions
  );

  const sessions = data?.division?.judging.sessions ?? null;
  const sessionInProgress = !!sessions?.some(session => session.status === 'in-progress');

  const handleStartSession = useCallback(
    async (sessionId: string) => {
      await startSessionMutation({
        variables: { sessionId, divisionId: currentDivision.id }
      });
    },
    [startSessionMutation, currentDivision.id]
  );

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Box sx={{ pt: 3 }}>
        {sessionInProgress ? (
          <Box sx={{ mb: 2, color: 'warning.main', fontWeight: 'bold' }}>IN PROGRESS</Box>
        ) : (
          <RoomScheduleTable
            sessions={sessions || []}
            loading={loading || !sessions}
            onStartSession={handleStartSession}
          />
        )}
      </Box>
    </>
  );
}
