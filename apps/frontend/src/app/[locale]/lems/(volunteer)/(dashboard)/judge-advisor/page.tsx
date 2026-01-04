'use client';

import { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../components/page-header';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { RubricStatusSummary } from './components/rubric-status-summary';
import { RubricStatusGrid } from './components/rubric-status-grid';
import { JudgeAdvisorProvider } from './components/judge-advisor-context';
import {
  GET_ALL_JUDGING_SESSIONS,
  createJudgingSessionStartedSubscription,
  createJudgingSessionAbortedSubscription,
  createJudgingSessionCompletedSubscription,
  createRubricStatusChangedSubscription,
  createTeamArrivalSubscription,
  createTeamDisqualifiedSubscription,
  parseDivisionSessions
} from './graphql';

export default function JudgeAdvisorPage() {
  const t = useTranslations('pages.judge-advisor');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionAbortedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createRubricStatusChangedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id),
      createTeamDisqualifiedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_ALL_JUDGING_SESSIONS,
    { divisionId: currentDivision.id },
    parseDivisionSessions,
    subscriptions
  );

  const sessions = data || [];

  return (
    <>
      <PageHeader title={t('page-title')} />
      <JudgeAdvisorProvider sessions={sessions} loading={loading}>
        <Stack spacing={3} mt={3}>
          <RubricStatusSummary />
          <RubricStatusGrid />
        </Stack>
      </JudgeAdvisorProvider>
    </>
  );
}
