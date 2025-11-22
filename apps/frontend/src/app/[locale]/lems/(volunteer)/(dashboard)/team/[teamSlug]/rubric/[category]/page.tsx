'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Container } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types';
import { PageHeader } from '../../../../components/page-header';
import { useTeam } from '../../components/team-context';
import { RubricActions } from './components/rubric-actions';
import { RubricTable } from './components/rubric-table';
import { AwardNominations } from './components/award-nominations';

export default function RubricPage() {
  const t = useTranslations('pages.rubric');
  const { getCategory } = useJudgingCategoryTranslations();
  const team = useTeam();

  const { category } = useParams();
  const schema = rubrics[category as JudgingCategory];

  const isEditable = true; // TODO: this.

  return (
    <>
      <PageHeader
        title={t('page-title', {
          category: getCategory(category as string),
          teamName: team.name,
          teamNumber: team.number
        })}
      />

      <Container maxWidth="md" sx={{ py: 4 }}>
        {schema.awards && <AwardNominations hasAwards={schema.awards} disabled={!isEditable} />}

        <RubricTable
          sections={schema.sections}
          category={category as JudgingCategory}
          disabled={!isEditable}
        />

        <RubricActions disabled={!isEditable} />
      </Container>
    </>
  );
}
