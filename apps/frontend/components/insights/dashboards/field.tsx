import { WithId } from 'mongodb';
import { green } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { Event } from '@lems/types';
import Stat from '../stat';
import CycleTimeReport from '../cycle-time-report';
import AverageMedianCard from '../average-median-card';
import MissionSuccessRateChart from '../charts/mission-success-rate-chart';
import InspectionBonusChart from '../charts/inspection-bonus-chart';
import PrecisionTokensChart from '../charts/precision-tokens-chart';
import ScoresPerTableChart from '../charts/scores-per-table-chart';
interface FieldInsightsDashboardProps {
  event: WithId<Event>;
}

const FieldInsightsDashboard: React.FC<FieldInsightsDashboardProps> = ({ event }) => {
  return (
    <Grid container spacing={2}>
      <Grid xs={4}>
        <AverageMedianCard
          title="ניקוד משחק הרובוט"
          color={green[600]}
          url={`/api/events/${event._id}/insights/field/scores/all`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <AverageMedianCard
          title="ניקוד גבוה ביותר"
          color={green[600]}
          url={`/api/events/${event._id}/insights/field/scores/top`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <Stat title="מדד זמני" value={100} sx={{ p: 2, width: '100%', height: '100%' }} />
      </Grid>
      <Grid xs={12}>
        <MissionSuccessRateChart event={event} />
      </Grid>
      <Grid xs={12}>
        <ScoresPerTableChart event={event} />
      </Grid>
      <Grid xs={12}>
        <InspectionBonusChart event={event} />
      </Grid>
      <Grid xs={12}>
        <PrecisionTokensChart event={event} />
      </Grid>
      <Grid xs={6}>
        <CycleTimeReport
          title="סייקלים - דירוג"
          url={`/api/events/${event._id}/insights/field/cycle-time?stage=ranking`}
        />
      </Grid>
      <Grid xs={6}>
        <CycleTimeReport
          title="סייקלים - אימונים"
          url={`/api/events/${event._id}/insights/field/cycle-time?stage=practice`}
        />
      </Grid>
    </Grid>
  );
};

export default FieldInsightsDashboard;
