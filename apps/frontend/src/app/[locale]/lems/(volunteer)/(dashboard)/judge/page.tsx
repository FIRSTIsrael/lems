'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Box, Button } from '@mui/material';
import { useMutation } from '@apollo/client/react';
import { ResponsiveComponent, useJudgingSounds } from '@lems/shared';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { SoundTestDialog } from '../components/sound-test-dialog';
import {
  GET_ROOM_JUDGING_SESSIONS,
  createTeamArrivalSubscription,
  createJudgingSessionStartedSubscription,
  START_JUDGING_SESSION_MUTATION,
  createJudgingSessionAbortedSubscription,
  ABORT_JUDGING_SESSION_MUTATION,
  createJudgingSessionCompletedSubscription,
  createRubricStatusChangedSubscription
} from './graphql';
import { RoomScheduleTable } from './components/schedule/room-schedule-table';
import { JudgingSessionProvider } from './components/timer/judging-session-context';
import { JudgingTimerDesktopLayout } from './components/timer/judging-timer-desktop-layout';
import { JudgingTimerMobileLayout } from './components/timer/judging-timer-mobile-layout';

export default function JudgePage() {
  const t = useTranslations('pages.judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const { playSound } = useJudgingSounds();

  const [openSoundTest, setOpenSoundTest] = useState(false);

  const [startSessionMutation] = useMutation(START_JUDGING_SESSION_MUTATION, {
    onError: () => {
      toast.error(t('error.start'));
    }
  });

  const [abortSessionMutation] = useMutation(ABORT_JUDGING_SESSION_MUTATION, {
    onError: () => {
      toast.error(t('error.abort'));
    }
  });

  const subscriptions = useMemo(
    () => [
      createTeamArrivalSubscription(currentDivision.id),
      createJudgingSessionStartedSubscription(currentDivision.id, () => {
        playSound('start');
      }),
      createJudgingSessionAbortedSubscription(currentDivision.id, () => {
        playSound('end');
      }),
      createJudgingSessionCompletedSubscription(currentDivision.id, () => {
        playSound('end');
      }),
      createRubricStatusChangedSubscription(currentDivision.id)
    ],
    [currentDivision.id, playSound]
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
  const judgingSessionLength = data?.division?.judging.sessionLength;

  const handleStartSession = useCallback(
    async (sessionId: string) => {
      await startSessionMutation({
        variables: { sessionId, divisionId: currentDivision.id }
      });
    },
    [startSessionMutation, currentDivision.id]
  );

  const handleAbortSession = useCallback(
    async (sessionId: string) => {
      await abortSessionMutation({
        variables: { sessionId, divisionId: currentDivision.id }
      });
    },
    [abortSessionMutation, currentDivision.id]
  );

  if (sessionInProgress) {
    return (
      <JudgingSessionProvider session={sessionInProgress} sessionLength={judgingSessionLength ?? 0}>
        <ResponsiveComponent
          mobile={<JudgingTimerMobileLayout onAbortSession={handleAbortSession} />}
          desktop={<JudgingTimerDesktopLayout onAbortSession={handleAbortSession} />}
        />
      </JudgingSessionProvider>
    );
  }

  return (
    <>
      <PageHeader title={t('page-title')}>
        <Button variant="contained" onClick={() => setOpenSoundTest(true)}>
          {t('sound-test.button-label')}
        </Button>
      </PageHeader>

      <Box sx={{ py: 3 }}>
        <RoomScheduleTable
          sessions={sessions || []}
          loading={loading || !sessions}
          onStartSession={handleStartSession}
        />
      </Box>
      <SoundTestDialog open={openSoundTest} setOpen={setOpenSoundTest} />
    </>
  );
}
