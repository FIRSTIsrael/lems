'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../components/page-header';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { RubricStatusSummary } from './components/rubric-status-summary';
import { RubricStatusGrid } from './components/rubric-status-grid';
import {
  GET_ALL_JUDGING_SESSIONS,
  createJudgingSessionStartedSubscription,
  createJudgingSessionAbortedSubscription,
  createJudgingSessionCompletedSubscription,
  createRubricStatusChangedSubscription
} from './judge-advisor.graphql';

export default function JudgeAdvisorPage() {
  const t = useTranslations('pages.judge-advisor');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionAbortedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createRubricStatusChangedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_ALL_JUDGING_SESSIONS,
    { divisionId: currentDivision.id },
    undefined,
    subscriptions
  );

  const sessions = data?.division?.judging.sessions ?? [];

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <RubricStatusSummary sessions={sessions} loading={loading} />
        <RubricStatusGrid sessions={sessions} loading={loading} />
      </Box>
    </>
  );
}