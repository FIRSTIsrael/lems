import { ObjectId, WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Stack } from '@mui/material';
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
  CoreValuesAwardsTypes,
  Award
} from '@lems/types';
import { localizedAward } from '@lems/season';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../insights/charts/scores-per-room-chart';
import AwardList from '../../award-list';
import TeamPool from '../../team-pool';

interface OptionalAwardsDeliberationLayoutProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
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
  awards,
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
      <Grid xs={6}>
        <p>Grid</p>
      </Grid>
      <Grid xs={3}>
        <TeamPool id="team-pool" teams={teams} />
      </Grid>
      <Grid xs={3}>
        <FinalDeliberationControlPanel
          teams={teams}
          deliberation={deliberation}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          enableTrash
          allowManualTeamAddition
          onAddTeam={() => {}}
        />
      </Grid>
      {/* 1.5 x number of lists*/}
      <Grid xs={4.5}>
        <Stack direction="row" spacing="2" gap={2} height="100%">
          {CoreValuesAwardsTypes.map(award => (
            <AwardList
              title={localizedAward[award].name}
              length={awards.filter(a => a.name === award).length}
              withIcons={true}
              trophyCount={awards.filter(a => a.name === award).length}
              id={award}
              pickList={[]} //TODO
              disabled={deliberation.status !== 'in-progress'}
              fullWidth
            />
          ))}
        </Stack>
      </Grid>
      <Grid xs={7.5}>
        <ScoresPerRoomChart division={division} height={210} />
      </Grid>
    </Grid>
  );
};

export default OptionalAwardsDeliberationLayout;
