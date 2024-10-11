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
  Award,
  CoreValuesAwards
} from '@lems/types';
import { localizedAward } from '@lems/season';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../insights/charts/scores-per-room-chart';
import AwardList from '../../award-list';
import TeamPool from '../../team-pool';
import CategoryDeliberationsGrid from '../../category/category-deliberations-grid';
import { apiFetch } from '../../../../lib/utils/fetch';
import { enqueueSnackbar } from 'notistack';

interface OptionalAwardsDeliberationLayoutProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  awards: Array<WithId<Award>>;
  rooms: Array<WithId<JudgingRoom>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  sessions: Array<WithId<JudgingSession>>;
  scoresheets: Array<WithId<Scoresheet>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  rankings: { [key in JudgingCategory]: Array<{ teamId: ObjectId; rank: number }> };
  robotGameRankings: Array<ObjectId>;
  deliberation: WithId<JudgingDeliberation>;
  startDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
  endDeliberationStage: (deliberation: WithId<JudgingDeliberation>) => void;
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
  deliberation,
  startDeliberationStage,
  endDeliberationStage
}) => {
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
  const eligibleTeams = teams.filter(team => {
    const rubric = rubrics.find(
      rubric => rubric.category === 'core-values' && rubric.teamId === team._id
    )!;
    return (
      !ineligibleTeams.includes(team._id) &&
      (Object.values(rubric.data?.awards ?? {}).some(nomination => !!nomination) ||
        deliberation.manualEligibility?.includes(team._id))
    );
  });
  const additionalTeams = teams.filter(
    team => !eligibleTeams.find(t => t._id === team._id) && !ineligibleTeams.includes(team._id)
  );

  const selectedTeams = [
    ...new Set([...CoreValuesAwardsTypes.map(award => deliberation.awards[award] ?? [])].flat(1))
  ];

  const nextStageUnlocked = CoreValuesAwardsTypes.every(
    awardName =>
      deliberation.awards[awardName]!.length ===
      awards.filter(award => award.name === awardName).length
  );

  const endOptionalAwardsStage = (deliberation: WithId<JudgingDeliberation>) => {
    const newAwards: { [key in CoreValuesAwards]?: Array<WithId<Team>> } = {};
    CoreValuesAwardsTypes.forEach(awardName => {
      newAwards[awardName] =
        deliberation.awards[awardName]!.map(teamId => teams.find(t => t._id === teamId)!) ?? [];
    });

    apiFetch(`/api/divisions/${division._id}/awards/winners`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAwards)
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
        <CategoryDeliberationsGrid
          category="core-values"
          cvForms={cvForms}
          rooms={rooms}
          rubrics={rubrics}
          scoresheets={scoresheets}
          selectedTeams={selectedTeams.map(teamId => teams.find(t => t._id === teamId)!)}
          sessions={sessions}
          teams={eligibleTeams}
          disabled={true}
          showRanks={false}
        />
      </Grid>
      <Grid xs={3}>
        <TeamPool
          id="team-pool"
          teams={eligibleTeams.filter(t => !selectedTeams.includes(t._id))}
          disabled={deliberation.status !== 'in-progress'}
        />
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
          additionalTeams={additionalTeams}
          onAddTeam={() => {}}
          nextStageUnlocked={nextStageUnlocked}
          startDeliberation={startDeliberationStage}
          endDeliberationStage={endOptionalAwardsStage}
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
              pickList={
                deliberation.awards[award]?.map(
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

export default OptionalAwardsDeliberationLayout;
