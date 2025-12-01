'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, CircularProgress, Box, Alert } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { useUser } from '../../../../../../components/user-context';
import { usePageData, type SubscriptionConfig } from '../../../../../hooks/use-page-data';
import { useEvent } from '../../../../../components/event-context';
import { RubricProvider } from './rubric-context';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';
import {
  GET_RUBRIC_QUERY,
  RubricQueryResult,
  GetRubricQueryVariables,
  parseRubricData,
  createRubricUpdatedSubscription
} from './rubric.graphql';

export default function RubricPage() {
  const t = useTranslations('pages.rubric');
  const { getCategory } = useJudgingCategoryTranslations();
  const team = useTeam();
  const user = useUser();
  const { currentDivision } = useEvent();

  const { category } = useParams();
  const schema = rubrics[category as JudgingCategory];

  const subscriptions = useMemo<SubscriptionConfig<unknown, RubricQueryResult>[]>(
    () => [
      createRubricUpdatedSubscription(currentDivision.id) as unknown as SubscriptionConfig<
        unknown,
        RubricQueryResult
      >
    ],
    [currentDivision.id]
  );
  // Fetch rubric data
  const { data: rubricQueryData, loading } = usePageData<
    RubricQueryResult,
    GetRubricQueryVariables
  >(
    GET_RUBRIC_QUERY,
    {
      divisionId: currentDivision.id,
      teamId: team.id,
      category: hyphensToUnderscores(category as string) as JudgingCategory
    },
    undefined,
    subscriptions
  );

  // Parse rubric from query data
  const rubric = useMemo(
    () => (rubricQueryData ? parseRubricData(rubricQueryData) : undefined),
    [rubricQueryData]
  );

  const isEditable = useMemo(() => {
    if (user.role === 'judge-advisor') {
      return true;
    }

    if (user.role === 'lead-judge') {
      return user.roleInfo?.['category'] === category;
    }

    return rubric ? ['empty', 'draft', 'completed'].includes(rubric.status) : false;
  }, [category, rubric, user.role, user.roleInfo]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!rubric) {
    return (
      <Box>
        <PageHeader
          title={t('page-title', {
            category: getCategory(category as string),
            teamName: team.name,
            teamNumber: team.number
          })}
        />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {t('rubric-not-found', { defaultValue: 'Rubric not found' })}
          </Alert>
        </Container>
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
        <RubricProvider rubric={rubric} divisionId={currentDivision.id}>
          <div>
            {schema.awards && <AwardNominations hasAwards={schema.awards} disabled={!isEditable} />}

            <RubricTable
              sections={schema.sections}
              category={category as JudgingCategory}
              disabled={!isEditable}
            />
          </div>
        </RubricProvider>
      </Container>
    </>
  );
}
