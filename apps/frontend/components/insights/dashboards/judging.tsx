import { WithId } from 'mongodb';
import { red } from '@mui/material/colors';
import Grid from '@mui/material/Unstable_Grid2';
import { Event } from '@lems/types';
import Stat from '../stat';
import AverageMedianCard from '../average-median-card';
import CategoryScoresChart from '../charts/category-scores-chart';
import JudgingRoomDelayChart from '../charts/judging-room-delay-chart';
import ScoresPerRoomChart from '../charts/scores-per-room-chart';
import RobotCorrelationChart from '../charts/robot-correlation-chart';

interface JudgingInsightsDashboardProps {
  event: WithId<Event>;
}

const JudgingInsightsDashboard: React.FC<JudgingInsightsDashboardProps> = ({ event }) => {
  return (
    <Grid container spacing={2}>
      <Grid xs={4}>
        <AverageMedianCard
          title="ציוני מחוונים"
          color={red[600]}
          url={`/api/events/${event._id}/insights/judging/scores/average-median`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <Stat
          title="ציון ממוצע גבוה ביותר"
          url={`/api/events/${event._id}/insights/judging/scores/highest-average-score`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <Stat
          title="קבוצות שהועמדו לפרסי רשות"
          url={`/api/events/${event._id}/insights/judging/optional-award-nominations`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={6}>
        <CategoryScoresChart event={event} />
      </Grid>
      <Grid xs={6}>
        <JudgingRoomDelayChart event={event} />
      </Grid>
      <Grid xs={12}>
        <ScoresPerRoomChart event={event} />
      </Grid>
      <Grid xs={12}>
        <RobotCorrelationChart event={event} />
      </Grid>
    </Grid>
  );
};

export default JudgingInsightsDashboard;
