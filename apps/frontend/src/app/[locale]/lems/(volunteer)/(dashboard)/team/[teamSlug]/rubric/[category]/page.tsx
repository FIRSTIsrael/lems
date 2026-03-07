'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, CircularProgress, Box, Stack } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { useUser } from '../../../../../components/user-context';
import { usePageData } from '../../../../../hooks/use-page-data';
import { useEvent } from '../../../../../components/event-context';
import { RubricProvider } from './rubric-context';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';
import { ResetRubricButton } from './components/reset-rubric-button';
import { LockUnlockRubricButton } from './components/lock-unlock-rubric-button';
import { SaveButton } from './components/save-button';
import { ApproveRubricButton } from './components/approve-rubric-button';
import { GET_RUBRIC_QUERY, parseRubricData, createRubricUpdatedSubscription } from './graphql';
import { ValidationAlert } from './components/validation-alert';

export default function RubricPage() {
  const t = useTranslations('pages.rubric');
  const { getCategory } = useJudgingCategoryTranslations();
  const team = useTeam();
  const user = useUser();
  const { currentDivision } = useEvent();

  const { category }: { category: JudgingCategory } = useParams();
  const schema = rubrics[category as JudgingCategory];

  const subscriptions = useMemo(
    () => [createRubricUpdatedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading } = usePageData(
    GET_RUBRIC_QUERY,
    {
      divisionId: currentDivision.id,
      teamId: team.id,
      category: hyphensToUnderscores(category)
    },
    parseRubricData,
    subscriptions
  );

  const isEditable = useMemo(() => {
    if (!data?.rubric) return false;

    if (user.role === 'judge-advisor') {
      return data.rubric.status !== 'approved';
    }

    if (user.role === 'lead-judge') {
      return user.roleInfo?.['category'] === category && data.rubric.status !== 'approved';
    }

    return data.rubric ? ['empty', 'draft', 'completed'].includes(data.rubric.status) : false;
  }, [category, data, user.role, user.roleInfo]);

  if (loading || !data?.rubric) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title={t('page-title', {
          category: getCategory(category as string),
          teamName: team.name,
          teamNumber: team.number
        })}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <RubricProvider rubric={data.rubric}>
          <ValidationAlert />
          {schema.awards && <AwardNominations awards={data.awards} disabled={!isEditable} />}

          <RubricTable
            sections={schema.sections}
            category={category as JudgingCategory}
            disabled={!isEditable}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
            <ResetRubricButton disabled={!isEditable} />
            <SaveButton disabled={!isEditable} />
            <LockUnlockRubricButton disabled={!isEditable} />
            <ApproveRubricButton disabled={!isEditable} />
            {/* Submit removed for now */}
            {/* <SubmitRubricButton disabled={!isEditable} /> */}
          </Stack>
        </RubricProvider>
      </Container>
    </>
  );
}
