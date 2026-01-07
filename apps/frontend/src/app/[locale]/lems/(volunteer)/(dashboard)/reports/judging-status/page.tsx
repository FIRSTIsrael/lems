'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { ResponsiveComponent } from '@lems/shared';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useEvent } from '../../../components/event-context';
import { PageHeader } from '../../components/page-header';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_JUDGING_STATUS,
  parseJudgingStatus,
  createJudgingSessionStartedSubscription,
  createJudgingSessionCompletedSubscription,
  createTeamArrivalSubscription,
  createMatchLoadedSubscription,
  createMatchStartedSubscription
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
      createTeamArrivalSubscription(currentDivision.id),
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_JUDGING_STATUS,
    { divisionId: currentDivision.id },
    undefined,
    subscriptions
  );

  const {
    sessions: currentSessions,
    nextSessions,
    rooms,
    sessionLength
  } = parseJudgingStatus(data ?? {});

  // Use time hook with test date for development
  const currentTime = useTime({ interval: 60000 });
  const testTime = dayjs().year(2025).month(11).date(29).hour(9).minute(10).second(0); // Note: month is 0-indexed
  const effectiveCurrentTime = testTime; // Use test time for development
  console.log('Test time set to:', effectiveCurrentTime.format('YYYY-MM-DD HH:mm:ss'));

  return (
    <>
      <PageHeader title={t('page-title')} />

      <Box sx={{ py: 3 }}>
        <ResponsiveComponent
          mobile={
            <JudgingStatusMobile
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              loading={loading}
              currentTime={effectiveCurrentTime}
            />
          }
          desktop={
            <JudgingStatusTable
              currentSessions={currentSessions}
              nextSessions={nextSessions}
              rooms={rooms}
              sessionLength={sessionLength}
              loading={loading}
              currentTime={effectiveCurrentTime}
            />
          }
        />
      </Box>
    </>
  );
}
