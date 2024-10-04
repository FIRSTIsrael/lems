import { useMemo, useState } from 'react';
import { ObjectId, WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  CoreValuesForm,
  JudgingDeliberation,
  ADVANCEMENT_PERCENTAGE
} from '@lems/types';
import ScoresPerRoomChart from '../../../components/insights/charts/scores-per-room-chart';

interface ReviewLayoutProps {
  division: WithId<Division>;
  deliberation: WithId<JudgingDeliberation>;
}

const ReviewLayout: React.FC<ReviewLayoutProps> = ({ division, deliberation }) => {
  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
      <Grid xs={2}>
        <p>Award</p>
      </Grid>
    </Grid>
  );
};

export default ReviewLayout;
