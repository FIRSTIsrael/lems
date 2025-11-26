'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container } from '@mui/material';
import { Formik, Form } from 'formik';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { useUser } from '../../../../../../components/user-context';
import { RubricActions } from './components/rubric-actions';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';
import { getEmptyRubric } from './rubric-utils';

export default function RubricPage() {
  const t = useTranslations('pages.rubric');
  const { getCategory } = useJudgingCategoryTranslations();
  const team = useTeam();
  const user = useUser();

  const { category } = useParams();
  const schema = rubrics[category as JudgingCategory];

  // TODO: Add rubric status
  const isEditable =
    (user.role === 'judge' && ['empty', 'in-progress', 'completed'].includes('empty')) ||
    (user.role === 'lead-judge' &&
      user.roleInfo?.['category'] === category &&
      ['empty', 'in-progress', 'completed', 'waiting-for-review'].includes('empty')) ||
    user.role === 'judge-advisor';

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
