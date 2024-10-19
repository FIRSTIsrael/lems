import { WithId } from 'mongodb';
import { green } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import { Division } from '@lems/types';
import Stat from '../stat';
import CycleTimeReport from '../cycle-time-report';
import AverageMedianCard from '../average-median-card';
import MissionSuccessRateChart from '../charts/mission-success-rate-chart';
import InspectionBonusChart from '../charts/inspection-bonus-chart';
import PrecisionTokensChart from '../charts/precision-tokens-chart';
import ScoresPerTableChart from '../charts/scores-per-table-chart';
import RobotConsistencyChart from '../charts/robot-consistency-chart';

interface FieldInsightsDashboardProps {
  division: WithId<Division>;
}

const FieldInsightsDashboard: React.FC<FieldInsightsDashboardProps> = ({ division }) => {
  return (
    (<Grid container spacing={2}>
      <Grid size={4}>
        <AverageMedianCard
          title="ניקוד משחק הרובוט"
          color={green[600]}
          url={`/api/divisions/${division._id}/insights/field/scores/average-median`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <AverageMedianCard
          title="ניקוד גבוה ביותר"
          color={green[600]}
          url={`/api/divisions/${division._id}/insights/field/scores/average-median/top-scores`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <Stat
          title="שיא ניקוד"
          url={`/api/divisions/${division._id}/insights/field/scores/highest-score`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={12}>
        <ScoresPerTableChart division={division} />
      </Grid>
      <Grid size={12}>
        <MissionSuccessRateChart division={division} />
      </Grid>
      <Grid size={12}>
        <InspectionBonusChart division={division} />
      </Grid>
      <Grid size={12}>
        <PrecisionTokensChart division={division} />
      </Grid>
      <Grid size={6}>
        <CycleTimeReport
          title="סייקלים - דירוג"
          url={`/api/divisions/${division._id}/insights/field/cycle-time?stage=ranking`}
        />
      </Grid>
      <Grid size={6}>
        <CycleTimeReport
          title="סייקלים - אימונים"
          url={`/api/divisions/${division._id}/insights/field/cycle-time?stage=practice`}
        />
      </Grid>
      <Grid size={12}>
        <RobotConsistencyChart division={division} />
      </Grid>
    </Grid>)
  );
};

export default FieldInsightsDashboard;
