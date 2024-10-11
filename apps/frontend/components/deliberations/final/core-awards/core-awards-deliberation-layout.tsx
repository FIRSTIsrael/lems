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
import { apiFetch } from '../../../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';

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
  startDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
  endDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
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
  anomalies,
  startDeliberationStage,
  endDeliberationStage
}) => {
  const preliminaryDeliberationTeams = Object.values(categoryPicklists).flat(1);
  const ineligibleTeams = teams
    .filter(
      team =>
        deliberation.disqualifications.includes(team._id) ||
        awards.find(
          award =>
            typeof award.winner !== 'string' &&
            award.name !== 'robot-performance' &&
            award.name !== 'advancement' &&
            award.winner?._id === team._id
        )
    )
    .map(team => team._id);
  const eligibleTeams = teams.filter(
    team =>
      !ineligibleTeams.includes(team._id) &&
      (preliminaryDeliberationTeams.includes(team._id) ||
        deliberation.manualEligibility?.includes(team._id))
  );
  const additionalTeams = teams.filter(
    team => !eligibleTeams.find(t => t._id === team._id) && !ineligibleTeams.includes(team._id)
  );

  const selectedTeams = [
    ...new Set(
      [...JudgingCategoryTypes.map(category => deliberation.awards[category] ?? [])].flat(1)
    )
  ];

  const nextStageUnlocked = JudgingCategoryTypes.every(
    category =>
      deliberation.awards[category]!.length ===
      awards.filter(award => award.name === category).length
  );

  const endCoreAwardsStage = (deliberation: WithId<JudgingDeliberation>) => {
    const newAwards: { [key in JudgingCategory]?: Array<WithId<Team>> } = {};
    JudgingCategoryTypes.forEach(category => {
      newAwards[category] =
        deliberation.awards[category]!.map(teamId => teams.find(t => t._id === teamId)!) ?? [];
    });

    const excellenceInEngineeringWinners: any[] = [];

    apiFetch(`/api/divisions/${division._id}/awards/winners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newAwards,
        'excellence-in-engineering': excellenceInEngineeringWinners
      })
    })
      .then(res => {
        if (!res.ok) {
          enqueueSnackbar('אופס, לא הצלחנו לשמור את זוכי הפרסים.', { variant: 'error' });
        }
      })
      .then(() => endDeliberationStage(deliberation));
  };

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
        <TeamPool
          id="team-pool"
          teams={eligibleTeams.filter(team => !selectedTeams.includes(team._id))}
          disabled={deliberation.status !== 'in-progress'}
        />
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
          nextStageUnlocked={nextStageUnlocked}
          startDeliberation={startDeliberationStage}
          endDeliberationStage={endCoreAwardsStage}
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
              pickList={
                deliberation.awards[category]?.map(
                  teamId => teams.find(t => t._id === teamId) ?? ({} as WithId<Team>)
                ) ?? []
              }
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
