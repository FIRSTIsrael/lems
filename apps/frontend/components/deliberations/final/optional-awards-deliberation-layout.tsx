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
import FinalDeliberationControlPanel from './final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../components/insights/charts/scores-per-room-chart';

interface OptionalAwardsDeliberationLayoutProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  rankings: { [key in JudgingCategory]: Array<ObjectId> };
  robotGameRankings: Array<ObjectId>;
  deliberation: WithId<JudgingDeliberation>;
}

const OptionalAwardsDeliberationLayout: React.FC<OptionalAwardsDeliberationLayoutProps> = ({
  division,
  teams,
  rooms,
  rubrics,
  sessions,
  scoresheets,
  cvForms,
  rankings,
  robotGameRankings,
  deliberation
}) => {
  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={8}>
        <p>Grid</p>
      </Grid>
      <Grid xs={4}>
        <FinalDeliberationControlPanel
          teams={teams}
          deliberation={deliberation}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          enableTrash
        />
      </Grid>
      <Grid xs={6}>
        <p>pool?</p>
      </Grid>
      <Grid xs={6}>
        <ScoresPerRoomChart division={division} height={210} />
      </Grid>
    </Grid>
  );
};

export default OptionalAwardsDeliberationLayout;
