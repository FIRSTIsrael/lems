import { useContext } from 'react';
import Grid from '@mui/material/Grid2';
import ScoresPerRoomChart from '../../insights/charts/scores-per-room-chart';
import TeamPool from '../team-pool';
import AwardList from '../award-list';
import { DeliberationContext } from '../deliberation';
import CategoryDeliberationsGrid from './category-deliberations-grid';
import CategoryDeliberationControlPanel from './category-deliberation-control-panel';
import { getDefaultPicklistLimit } from '../../../lib/utils/math';

const CategoryDeliberationLayout: React.FC = () => {
  const {
    deliberation,
    teams,
    awards,
    selectedTeams,
    availableTeams,
    eligibleTeams,
    suggestedTeam,
    compareContextProps,
    start,
    lock,
    appendToPicklist,
    updateTeamAwards
  } = useContext(DeliberationContext);
  const category = deliberation.category!;
  const picklist = (deliberation.awards[category] ?? []).map(
    teamId => teams.find(team => team._id === teamId)!
  );
  const picklistLimit = getDefaultPicklistLimit(teams.length);

  return (
    <Grid container sx={{ pt: 2 }} columnSpacing={4} rowSpacing={2}>
      <Grid size={8}>
        <CategoryDeliberationsGrid
          category={category}
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          selectedTeams={selectedTeams}
          updateTeamAwards={updateTeamAwards}
          disabled={deliberation.status !== 'in-progress'}
          showNormalizedScores={true}
          showRanks={true}
          suggestedTeam={picklist.length < picklistLimit ? suggestedTeam : null}
          divisionAwards={awards}
        />
      </Grid>
      <Grid size={1.5}>
        <AwardList
          id={category}
          pickList={picklist}
          length={picklistLimit}
          disabled={deliberation.status !== 'in-progress'}
          suggestedTeam={suggestedTeam}
          addSuggestedTeam={teamId => appendToPicklist(category, teamId)}
        />
      </Grid>
      <Grid size={2.5}>
        <CategoryDeliberationControlPanel
          compareTeams={teams.filter(team => eligibleTeams.includes(team._id))}
          deliberation={deliberation}
          category={category}
          startDeliberation={start}
          lockDeliberation={lock}
          compareProps={compareContextProps}
        />
      </Grid>
      <Grid size={5}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
      <Grid size={7}>
        <TeamPool
          teams={teams
            .filter(team => availableTeams.includes(team._id))
            .sort((a, b) => b.scores[category] - a.scores[category])}
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
    </Grid>
  );
};

export default CategoryDeliberationLayout;
