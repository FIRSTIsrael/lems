'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../components/page-header';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { RubricStatusSummary } from './components/rubric-status-summary';
import { RubricStatusGrid } from './components/rubric-status-grid';
import { DisqualificationSection } from './components/disqualification/disqualification-section';
import { DeliberationStatusSection } from './components/deliberation/deliberation-status-section';
import { PersonalAwardsSection } from './components/personal-awards-section';
import { JudgeAdvisorProvider } from './components/judge-advisor-context';
import {
  JudgeAdvisorModeToggle,
  type JudgeAdvisorMode
} from './components/judge-advisor-mode-toggle';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentDivision } = useEvent();

  const mode = useMemo<JudgeAdvisorMode>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'awards' || tabParam === 'judging') {
      return tabParam;
    }
    return 'judging';
  }, [searchParams]);

  const setMode = (newMode: JudgeAdvisorMode) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', newMode);
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleModeChange = (newMode: JudgeAdvisorMode) => {
    setMode(newMode);
  };

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

  const sessions = data?.sessions || [];
  const awards = data?.awards || [];
  const deliberations = data?.deliberations || {};
  const finalDeliberation = data?.finalDeliberation ?? null;
  const sessionLength = data?.sessionLength ?? 0;

  return (
    <JudgeAdvisorProvider
      sessions={sessions}
      awards={awards}
      deliberations={deliberations}
      finalDeliberation={finalDeliberation}
      sessionLength={sessionLength}
      loading={loading}
    >
      <PageHeader title={t('page-title')}>
        <JudgeAdvisorModeToggle mode={mode} setMode={handleModeChange} />
      </PageHeader>

      {mode === 'judging' && (
        <Stack spacing={3} my={3}>
          <RubricStatusSummary />
          <RubricStatusGrid />
        </Stack>
      )}

      {mode === 'awards' && (
        <Stack spacing={3} my={3}>
          <DisqualificationSection />
          <DeliberationStatusSection />
          <PersonalAwardsSection />
        </Stack>
      )}
    </JudgeAdvisorProvider>
  );
}
