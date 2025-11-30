'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container } from '@mui/material';
import { Formik, Form } from 'formik';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/types/judging';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { useUser } from '../../../../../../components/user-context';
import { usePageData } from '../../../../../hooks/use-page-data';
import { useEvent } from '../../../../../components/event-context';
import { RubricActions } from './components/rubric-actions';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';
import { getEmptyRubric } from './rubric-utils';
import { GET_RUBRIC_QUERY, RubricQueryResult, GetRubricQueryVariables } from './rubric.graphql';

export default function RubricPage() {
  const t = useTranslations('pages.rubric');
  const { getCategory } = useJudgingCategoryTranslations();
  const team = useTeam();
  const user = useUser();
  const { currentDivision } = useEvent();

  const { category } = useParams();
  const schema = rubrics[category as JudgingCategory];

  const { data: rubricQueryData } = usePageData<RubricQueryResult, GetRubricQueryVariables>(
    GET_RUBRIC_QUERY,
    {
      divisionId: currentDivision.id,
      teamId: team.id,
      category: hyphensToUnderscores(category as string) as JudgingCategory
    }
  );

  const rubric = rubricQueryData?.division.judging.rubrics[0];

  const isEditable = useMemo(() => {
    if (user.role === 'judge-advisor') {
      return true;
    }

    if (user.role === 'lead-judge') {
      return user.roleInfo?.['category'] === category;
    }

    return rubric ? ['empty', 'draft', 'completed'].includes(rubric.status) : false;
  }, [category, rubric, user.role, user.roleInfo]);

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
        <Formik
          initialValues={getEmptyRubric(category as JudgingCategory)}
          onSubmit={() => {}}
          enableReinitialize
        >
          {() => (
            <Form>
              {schema.awards && (
                <AwardNominations hasAwards={schema.awards} disabled={!isEditable} />
              )}

              <RubricTable
                sections={schema.sections}
                category={category as JudgingCategory}
                disabled={!isEditable}
              />

              <RubricActions disabled={!isEditable} />
            </Form>
          )}
        </Formik>
      </Container>
    </>
  );
}
