'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container, CircularProgress, Box } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { useUser } from '../../../../../../components/user-context';
import { usePageData } from '../../../../../hooks/use-page-data';
import { useEvent } from '../../../../../components/event-context';
import { RubricProvider } from './rubric-context';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';
import {
  GET_RUBRIC_QUERY,
  parseRubricData,
  createRubricUpdatedSubscription
} from './rubric.graphql';
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

  const { data: rubric, loading } = usePageData(
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
    if (!rubric) return false;

    if (user.role === 'judge-advisor') {
      return rubric.status !== 'approved';
    }

    if (user.role === 'lead-judge') {
      return user.roleInfo?.['category'] === category && rubric.status !== 'approved';
    }

    return rubric ? ['empty', 'draft', 'completed'].includes(rubric.status) : false;
  }, [category, rubric, user.role, user.roleInfo]);

  if (loading || !rubric) {
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
        <RubricProvider rubric={rubric}>
          <ValidationAlert />
          {schema.awards && <AwardNominations hasAwards={schema.awards} disabled={!isEditable} />}

          <RubricTable
            sections={schema.sections}
            category={category as JudgingCategory}
            disabled={!isEditable}
          />
        </RubricProvider>
      </Container>
    </>
  );
}
