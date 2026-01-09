'use client';

import { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import {
  createTeamArrivalUpdatedSubscription,
  createRubricUpdatedSubscription,
  createScoresheetUpdatedSubscription,
  createFinalDeliberationStatusChangedSubscription,
  createFinalDeliberationUpdatedSubscription,
  GET_FINAL_DELIBERATION,
  parseFinalDeliberationData
} from './graphql';

export default function FinalDeliberationPage(): React.ReactElement {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createTeamArrivalUpdatedSubscription(currentDivision.id),
      createRubricUpdatedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id),
      createFinalDeliberationStatusChangedSubscription(currentDivision.id),
      createFinalDeliberationUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data: division, loading } = usePageData(
    GET_FINAL_DELIBERATION,
    {
      divisionId: currentDivision.id
    },
    parseFinalDeliberationData,
    subscriptions
  );

  // Now handle conditional rendering after all hooks are defined
  if (loading || !division) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (<></>);
}
