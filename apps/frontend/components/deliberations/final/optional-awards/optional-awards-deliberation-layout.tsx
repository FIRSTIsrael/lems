import { useContext } from 'react';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Grid2';
import { Stack } from '@mui/material';
import { Team, CoreValuesAwardsTypes, AwardNames, AwardLimits } from '@lems/types';
import { localizedAward } from '@lems/season';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../insights/charts/scores-per-room-chart';
import AwardList from '../../award-list';
import TeamPool from '../../team-pool';
import CategoryDeliberationsGrid from '../../category/category-deliberations-grid';
import { DeliberationContext } from '../../deliberation';

const OptionalAwardsDeliberationLayout: React.FC = () => {
  const {
    teams,
    selectedTeams,
    additionalTeams,
    deliberation,
    eligibleTeams,
    availableTeams,
    picklistLimits,
    compareContextProps,
    start,
    endStage,
    onAddTeam,
    disqualifyTeam
  } = useContext(DeliberationContext);

  const limits = CoreValuesAwardsTypes.reduce(
    (acc, award) => {
      acc[award] = picklistLimits[award as AwardNames] ?? AwardLimits[award as AwardNames]!;
      return acc;
    },
    {} as { [key in AwardNames]?: number }
  );

  const nextStageUnlocked = CoreValuesAwardsTypes.every(
    award => deliberation.awards[award]!.length === limits[award]
  );

  return (
    (<Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid size={6}>
        <CategoryDeliberationsGrid
          category="core-values"
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          selectedTeams={selectedTeams}
          showNormalizedScores={false}
          showRanks={false}
        />
      </Grid>
      <Grid size={3}>
        <TeamPool
          teams={teams
            .filter(team => availableTeams.includes(team._id))
            .sort((a, b) => a.number - b.number)}
          id="team-pool"
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
      <Grid size={3}>
        <FinalDeliberationControlPanel
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          deliberation={deliberation}
          startDeliberation={start}
          endDeliberationStage={endStage ?? (() => {})}
          nextStageUnlocked={nextStageUnlocked}
          compareProps={compareContextProps}
          allowManualTeamAddition
          additionalTeams={additionalTeams}
          onAddTeam={onAddTeam}
          disqualifyTeam={disqualifyTeam}
          enableTrash
        />
      </Grid>
      {/* 1.5 x number of lists*/}
      <Grid size={4.5}>
        <Stack direction="row" spacing="2" gap={2} height="100%">
          {CoreValuesAwardsTypes.map(award => (
            <AwardList
              title={localizedAward[award].name}
              length={limits[award]!}
              withIcons
              trophyCount={limits[award]!}
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
      <Grid size={7.5}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
    </Grid>)
  );
};

export default OptionalAwardsDeliberationLayout;
