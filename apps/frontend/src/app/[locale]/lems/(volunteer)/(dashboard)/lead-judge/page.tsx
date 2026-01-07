'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Stack } from '@mui/material';
import { JudgingCategory } from '@lems/database';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { PageHeader } from '../components/page-header';
import { useUser } from '../../../components/user-context';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { LeadJudgeProvider } from './components/lead-judge-context';
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
  parseLeadJudgeData
} from './graphql';

export default function LeadJudgePage() {
  const t = useTranslations('pages.lead-judge');
  const { currentDivision } = useEvent();
  const { roleInfo } = useUser();

  const [teamFilter, setTeamFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const category = getLeadJudgeCategory(
    roleInfo?.['category'] as string | undefined
  ) as JudgingCategory;

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
      <PageHeader title={t('page-title')} />
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ height: 'fit-content' }}>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 320px' }, minWidth: 0 }}>
            <RubricStatusSummary
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 auto' }, minWidth: 0 }}>
            <RubricStatusList teamFilter={teamFilter} statusFilter={statusFilter} />
          </Box>
        </Stack>
      </Box>
    </LeadJudgeProvider>
  );
}
