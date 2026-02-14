'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/database';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { PageHeader } from '../components/page-header';
import { useUser } from '../../components/user-context';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { LeadJudgeProvider } from './components/lead-judge-context';
import { FiltersProvider } from './components/filters-context';
import { RubricStatusSummary } from './components/rubric-status-summary';
import { RubricStatusList } from './components/rubric-status-list';
import { getDesiredPicklistLength } from './components/utils';
import {
  GET_LEAD_JUDGE_DATA,
  createJudgingSessionStartedSubscription,
  createJudgingSessionAbortedSubscription,
  createJudgingSessionCompletedSubscription,
  createRubricStatusChangedSubscription,
  createTeamArrivalSubscription,
  getLeadJudgeCategory,
  parseLeadJudgeData,
  createDeliberationUpdatedSubscription
} from './graphql';

export default function LeadJudgePage() {
  const t = useTranslations('pages.lead-judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const category = getLeadJudgeCategory(
    roleInfo?.['category'] as string | undefined
  ) as JudgingCategory;

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionAbortedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createRubricStatusChangedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id),
      createDeliberationUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_LEAD_JUDGE_DATA,
    {
      divisionId: currentDivision.id,
      category: hyphensToUnderscores(category)
    },
    parseLeadJudgeData,
    subscriptions
  );

  const sessions = data?.sessions || [];
  const deliberation = data?.deliberation || null;
  const sessionLength = data?.sessionLength ?? 0;
  const desiredPicklistLength = useMemo(
    () => getDesiredPicklistLength(sessions.length),
    [sessions.length]
  );

  return (
    <LeadJudgeProvider
      sessions={sessions}
      category={category}
      deliberation={deliberation}
      desiredPicklistLength={desiredPicklistLength}
      sessionLength={sessionLength}
      loading={loading}
    >
      <FiltersProvider>
        <PageHeader title={t('page-title')} />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ height: 'fit-content' }}>
            <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 320px' }, minWidth: 0 }}>
              <RubricStatusSummary />
            </Box>
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 auto' }, minWidth: 0 }}>
              <RubricStatusList />
            </Box>
          </Stack>
        </Box>
      </FiltersProvider>
    </LeadJudgeProvider>
  );
}
