import { useContext } from 'react';
import { WithId } from 'mongodb';
import { Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { JudgingCategory, Team, JudgingCategoryTypes, AwardLimits } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ScoresPerRoomChart from '../../../insights/charts/scores-per-room-chart';
import TeamPool from '../../team-pool';
import AwardList from '../../award-list';
import { DeliberationContext } from '../../deliberation';
import CoreAwardsDeliberationGrid from './core-awards-deliberation-grid';

const CoreAwardsDeliberationLayout: React.FC = () => {
  const {
    teams,
    availableTeams,
    additionalTeams,
    deliberation,
    eligibleTeams,
    picklistLimits,
    compareContextProps,
    anomalies,
    categoryRanks,
    start,
    endStage,
    onAddTeam,
    disqualifyTeam,
    selectedTeams
  } = useContext(DeliberationContext);

  const limits = JudgingCategoryTypes.reduce(
    (acc, category) => {
      acc[category] =
        picklistLimits[category as JudgingCategory] ?? AwardLimits[category as JudgingCategory]!;
      return acc;
    },
    {} as { [key in JudgingCategory]: number }
  );

  const nextStageUnlocked = JudgingCategoryTypes.every(
    category => deliberation.awards[category]!.length === limits[category]
  );

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid size={6}>
        <CoreAwardsDeliberationGrid
          categoryRanks={categoryRanks!}
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          anomalies={anomalies ?? []}
          selectedTeams={selectedTeams}
          additionalTeams={deliberation.manualEligibility ?? []}
        />
      </Grid>
      <Grid size={3}>
        <TeamPool
          teams={teams
            .filter(team => availableTeams.includes(team._id))
            .sort((a, b) => a.number - b.number)}
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
      <Grid size={5}>
        <Stack direction="row" spacing="2" gap={2} height="100%">
          {JudgingCategoryTypes.map((category, index) => (
            <AwardList
              key={index}
              title={localizedJudgingCategory[category].name}
              length={limits[category]}
              withIcons={true}
              trophyCount={limits[category]}
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
      <Grid size={7}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
    </Grid>
  );
};

export default CoreAwardsDeliberationLayout;
