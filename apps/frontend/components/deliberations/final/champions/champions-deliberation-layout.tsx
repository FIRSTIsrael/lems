import { useContext } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
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
      <Grid xs={7}>
        <ChampionsDeliberationsGrid
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          selectedTeams={selectedTeams}
          anomalies={anomalies ?? []}
        />
      </Grid>
      <Grid xs={2}>
        <AnomalyTeams teams={teams} anomalies={anomalies ?? []} />
      </Grid>
      <Grid xs={3}>
        <FinalDeliberationControlPanel
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          deliberation={deliberation}
          nextStageUnlocked={deliberation.awards['champions']?.length === places}
          startDeliberation={start}
          disqualifyTeam={disqualifyTeam}
          endDeliberationStage={endStage ?? (() => {})}
          compareProps={compareContextProps}
        />
      </Grid>
      <Grid xs={6}>
        <ChampionsPodium
          places={places}
          teams={teams.filter(team => eligibleTeams.includes(team._id))}
          award={deliberation.awards['champions'] ?? []}
          setAward={list => setPicklist('champions', list)}
          disabled={deliberation.status !== 'in-progress'}
        />
      </Grid>
      <Grid xs={6}>
        <ScoresPerRoomChart divisionId={deliberation.divisionId} height={210} />
      </Grid>
    </Grid>
  );
};

export default ChampionsDeliberationLayout;
