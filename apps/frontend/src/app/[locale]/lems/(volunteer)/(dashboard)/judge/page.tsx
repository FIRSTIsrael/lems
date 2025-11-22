'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Box } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { ResponsiveComponent } from '@lems/shared';
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
import { RoomScheduleTable } from './components/schedule/room-schedule-table';
import { useJudgingSounds } from './components/timer/hooks/use-judging-sounds';
import { JudgingSessionProvider } from './components/timer/judging-session-context';
import { JudgingTimerDesktopLayout } from './components/timer/judging-timer-desktop-layout';
import { JudgingTimerMobileLayout } from './components/timer/judging-timer-mobile-layout';

export default function JudgePage() {
  const t = useTranslations('pages.judge');

  const playSound = useJudgingSounds();
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
  const sessionInProgress = sessions?.find(session => session.status === 'in-progress');
  const judgingSessionLength = data?.division?.judging.judgingSessionLength;

  const handleStartSession = useCallback(
    async (sessionId: string) => {
      await startSessionMutation({
        variables: { sessionId, divisionId: currentDivision.id }
      });
      playSound('start');
    },
    [startSessionMutation, currentDivision.id, playSound]
  );

  if (sessionInProgress) {
    return (
      <JudgingSessionProvider session={sessionInProgress} sessionLength={judgingSessionLength ?? 0}>
        <ResponsiveComponent
          mobile={<JudgingTimerMobileLayout />}
          desktop={<JudgingTimerDesktopLayout />}
        />
      </JudgingSessionProvider>
    );
  }

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Box sx={{ pt: 3 }}>
        <RoomScheduleTable
          sessions={sessions || []}
          loading={loading || !sessions}
          onStartSession={handleStartSession}
        />
      </Box>
    </>
  );
}
