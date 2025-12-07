'use client';

import { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PageHeader } from '../components/page-header';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { RubricStatusSummary } from './components/rubric-status-summary';
import { RubricStatusList } from './components/rubric-status-list';
import {
  GET_ALL_JUDGING_SESSIONS,
  createJudgingSessionStartedSubscription,
  createJudgingSessionAbortedSubscription,
  createJudgingSessionCompletedSubscription,
  createRubricStatusChangedSubscription,
  createTeamArrivalSubscription,
  getLeadJudgeCategory,
  parseDivisionSessions
} from './lead-judge.graphql';
import { useUser } from '../../../components/user-context';
import { JudgingCategory } from '@lems/database';

export default function LeadJudgePage() {
  const t = useTranslations('pages.lead-judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const category = getLeadJudgeCategory(roleInfo?.['category'] as string | undefined) as JudgingCategory;

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionAbortedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createRubricStatusChangedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );
  
  const { data, loading } = usePageData(
    GET_ALL_JUDGING_SESSIONS,
    { 
      divisionId: currentDivision.id
    },
    parseDivisionSessions,
    subscriptions
  );

  const sessions = data || [];

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ height: 'fit-content' }}>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 320px' }, minWidth: 0 }}>
            <RubricStatusSummary sessions={sessions} category={category} loading={loading} />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 auto' }, minWidth: 0 }}>
            <RubricStatusList sessions={sessions} category={category} loading={loading} />
          </Box>
        </Stack>
      </Box>
    </>
  );
}