import { ObjectId, WithId } from 'mongodb';
import { Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Division,
  JudgingCategory,
  Rubric,
  Team,
  Scoresheet,
  JudgingSession,
  JudgingRoom,
  JudgingCategoryTypes,
  CoreValuesForm,
  JudgingDeliberation,
  Award,
  AwardNames
} from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../insights/charts/scores-per-room-chart';
import CoreAwardsDeliberationGrid from './core-awards-deliberation-grid';
import TeamPool from '../../team-pool';
import AwardList from '../../award-list';

interface CoreAwardsDeliberationLayoutProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  deliberation: WithId<JudgingDeliberation>;
  categoryPicklists: Array<{ [key in AwardNames]?: Array<ObjectId> }>;
}

const CoreAwardsDeliberationLayout: React.FC<CoreAwardsDeliberationLayoutProps> = ({
  division,
  teams,
  awards,
  rooms,
  sessions,
  rubrics,
  scoresheets,
  cvForms,
  deliberation,
  categoryPicklists
}) => {
  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={6}>
        <CoreAwardsDeliberationGrid
          teams={teams}
          rooms={rooms}
          sessions={sessions}
          cvForms={cvForms}
          scoresheets={scoresheets}
          categoryPicklists={categoryPicklists}
        />
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
          allowManualTeamAddition
          onAddTeam={() => console.log('added team')} //TODO
          enableTrash
        />
      </Grid>
      {/* 1.5 x number of lists*/}
      <Grid xs={4.5}>
        <Stack direction="row" spacing="2" gap={2} height="100%">
          {JudgingCategoryTypes.map(category => (
            <AwardList
              title={localizedJudgingCategory[category].name}
              length={awards.filter(award => award.name === category).length}
              withIcons={true}
              trophyCount={awards.filter(award => award.name === category).length}
              id={category}
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

export default CoreAwardsDeliberationLayout;
