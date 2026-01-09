'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useEvent } from '../../../components/event-context';
import { PageHeader } from '../../components/page-header';
import { usePageData } from '../../../hooks/use-page-data';
import { CountdownHeader } from './components/countdown-header';
import {
  GET_JUDGING_STATUS,
  parseJudgingStatus,
  createJudgingSessionStartedSubscription,
  createJudgingSessionCompletedSubscription,
  createTeamArrivalSubscription
} from './graphql';
import { JudgingStatusTable } from './components/judging-status-table';
import { JudgingStatusMobile } from './components/judging-status-mobile';

export default function JudgingStatusPage() {
  const t = useTranslations('pages.judging-status');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_JUDGING_STATUS,
    { divisionId: currentDivision.id },
    parseJudgingStatus,
    subscriptions
  );

  const currentTime = useTime({ interval: 1000 });

  if (!data) {
    return null;
  }

  const { sessions: currentSessions, nextSessions, rooms, sessionLength } = data;

  return (
    <>
      <PageHeader title={t('page-title')} />

      <CountdownHeader
        currentSessions={currentSessions}
        sessionLength={sessionLength}
        currentTime={currentTime}
      />

      <Box sx={{ py: 1 }}>
        <ResponsiveComponent
          mobile={
            <JudgingStatusMobile
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              loading={loading}
              currentTime={currentTime}
            />
          }
          desktop={
            <JudgingStatusTable
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              loading={loading}
              currentTime={currentTime}
            />
          }
        />
      </Box>
    </>
  );
}
