import { useContext } from 'react';
import Grid from '@mui/material/Grid2';
import { AwardLimits } from '@lems/types';
import ChampionsDeliberationsGrid from './champions-deliberation-grid';
import FinalDeliberationControlPanel from '../final-deliberation-control-panel';
import ChampionsPodium from './champions-podium';
import ScoresPerRoomChart from '../../../../components/insights/charts/scores-per-room-chart';
import AnomalyTeams from '../anomaly-teams';
import { DeliberationContext } from '../../deliberation';

const ChampionsDeliberationLayout: React.FC = () => {
  const {
    deliberation,
    teams,
    eligibleTeams,
    picklistLimits,
    selectedTeams,
    setPicklist,
    compareContextProps,
    anomalies,
    start,
    endStage,
    disqualifyTeam
  } = useContext(DeliberationContext);

  const places = picklistLimits['champions'] ?? AwardLimits['champions']!;

  return (
    <Grid container pt={2} columnSpacing={4} rowSpacing={2}>
      <Grid size={7}>
        <ChampionsDeliberationsGrid
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          selectedTeams={selectedTeams}
          anomalies={anomalies ?? []}
        />
      </Grid>
      <Grid size={2}>
        <AnomalyTeams teams={teams} anomalies={anomalies ?? []} />
      </Grid>
      <Grid size={3}>
        <FinalDeliberationControlPanel
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          deliberation={deliberation}
          nextStageUnlocked={deliberation.awards['champions']?.length === places}
          startDeliberation={start}
          disqualifyTeam={disqualifyTeam}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          endDeliberationStage={endStage ?? (() => {})}
          compareProps={compareContextProps}
        />
      </Grid>
      <Grid size={6}>
        <ChampionsPodium
          places={places}
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          award={deliberation.awards['champions'] ?? []}
          setAward={list => setPicklist('champions', list)}
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
      <Grid size={6}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
    </Grid>
  );
};

export default ChampionsDeliberationLayout;
