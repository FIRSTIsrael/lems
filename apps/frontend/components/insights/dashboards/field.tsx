import { WithId } from 'mongodb';
import { green } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { Event } from '@lems/types';
import Stat from '../stat';
import AverageMedianCard from '../average-median-card';
import MissionSuccessRateChart from '../charts/mission-success-rate-chart';
import InspectionBonusChart from '../charts/inspection-bonus-chart';
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
        <InspectionBonusChart event={event} />
      </Grid>
    </Grid>
  );
};

export default FieldInsightsDashboard;
