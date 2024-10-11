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
  DeliberationAnomaly
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
  categoryPicklists: { [key in JudgingCategory]: Array<ObjectId> };
  anomalies: Array<DeliberationAnomaly>;
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
  categoryPicklists,
  anomalies
}) => {
  const preliminaryDeliberationTeams = Object.values(categoryPicklists).flat(1);
  const eligibleTeams = teams.filter(
    team =>
      !deliberation.disqualifications.includes(team._id) &&
      !awards.find(
        award =>
          typeof award.winner !== 'string' &&
          award.name !== 'robot-performance' &&
          award.winner?._id === team._id
      ) &&
      (preliminaryDeliberationTeams.includes(team._id) ||
        deliberation.manualEligibility?.includes(team._id))
  );
  const additionalTeams = teams.filter(
    team =>
      !eligibleTeams.find(t => t._id === team._id) &&
      !deliberation.disqualifications.includes(team._id)
  );

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid xs={6}>
        <CoreAwardsDeliberationGrid
          teams={eligibleTeams}
          rubrics={rubrics}
          rooms={rooms}
          sessions={sessions}
          cvForms={cvForms}
          scoresheets={scoresheets}
          categoryPicklists={categoryPicklists}
          anomalies={anomalies}
        />
      </Grid>
      <Grid xs={3}>
        <TeamPool id="team-pool" teams={eligibleTeams} />
      </Grid>
      <Grid xs={3}>
        <FinalDeliberationControlPanel
          teams={eligibleTeams}
          deliberation={deliberation}
          cvForms={cvForms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          allowManualTeamAddition
          additionalTeams={additionalTeams}
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
