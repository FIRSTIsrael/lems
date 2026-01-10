'use client';

import { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { SmallScreenBlock } from '../components/small-screen-block';
import {
  createFinalDeliberationStatusChangedSubscription,
  createFinalDeliberationUpdatedSubscription,
  GET_FINAL_DELIBERATION,
  parseFinalDeliberationData
} from './graphql';
import { FinalDeliberationGrid } from './components/final-deliberation-grid';
import { FinalDeliberationProvider } from './final-deliberation-context';

export default function FinalDeliberationPage(): React.ReactElement {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
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

  return (
    <FinalDeliberationProvider division={division} divisionId={currentDivision.id}>
      <ResponsiveComponent
        mobileBreakpoint="lg"
        desktop={<FinalDeliberationGrid />}
        mobile={<SmallScreenBlock />}
      />
    </FinalDeliberationProvider>
  );
}
