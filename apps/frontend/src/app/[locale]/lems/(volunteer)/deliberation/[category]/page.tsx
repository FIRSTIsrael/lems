'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { ResponsiveComponent } from '@lems/shared';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { CategoryDeliberationProvider } from './deliberation-context';
import { SmallScreenBlock } from './components/small-screen-block';
import { DeliberationGrid } from './components/deliberation-grid';
import {
  GET_CATEGORY_DELIBERATION,
  parseCategoryDeliberationData,
  createDeliberationUpdatedSubscription,
  createTeamArrivalUpdatedSubscription,
  createRubricUpdatedSubscription,
  createScoresheetUpdatedSubscription,
  createTeamDisqualifiedSubscription
} from './graphql';

export default function CategoryDeliberationPage() {
  const { currentDivision } = useEvent();
  const { category }: { category: JudgingCategory } = useParams();

  const categoryEnum = hyphensToUnderscores(category) as JudgingCategory;

  const subscriptions = useMemo(
    () => [
      createDeliberationUpdatedSubscription(currentDivision.id),
      createTeamArrivalUpdatedSubscription(currentDivision.id),
      createRubricUpdatedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id),
      createTeamDisqualifiedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data: division, loading } = usePageData(
    GET_CATEGORY_DELIBERATION,
    {
      divisionId: currentDivision.id,
      category: categoryEnum
    },
    parseCategoryDeliberationData,
    subscriptions
  );

  if (loading || !division) {
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
    <CategoryDeliberationProvider
      divisionId={currentDivision.id}
      category={categoryEnum}
      division={division}
    >
      <ResponsiveComponent
        mobileBreakpoint="lg"
        desktop={<DeliberationGrid />}
        mobile={<SmallScreenBlock />}
      />
    </CategoryDeliberationProvider>
  );
}
