import { WithId } from 'mongodb';
import { red } from '@mui/material/colors';
import Grid from '@mui/material/Grid2';
import { Division } from '@lems/types';
import Stat from '../stat';
import AverageMedianCard from '../average-median-card';
import CategoryScoresChart from '../charts/category-scores-chart';
import JudgingRoomDelayChart from '../charts/judging-room-delay-chart';
import ScoresPerRoomChart from '../charts/scores-per-room-chart';
import RobotCorrelationChart from '../charts/robot-correlation-chart';

interface JudgingInsightsDashboardProps {
  division: WithId<Division>;
}

const JudgingInsightsDashboard: React.FC<JudgingInsightsDashboardProps> = ({ division }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={4}>
        <AverageMedianCard
          title="ציוני מחוונים"
          color={red[600]}
          url={`/api/divisions/${division._id}/insights/judging/scores/average-median`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <Stat
          title="ציון ממוצע גבוה ביותר"
          url={`/api/divisions/${division._id}/insights/judging/scores/highest-average-score`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={4}>
        <Stat
          title="קבוצות שהועמדו לפרסי רשות"
          url={`/api/divisions/${division._id}/insights/judging/optional-award-nominations`}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid size={6}>
        <CategoryScoresChart division={division} />
      </Grid>
      <Grid size={6}>
        <JudgingRoomDelayChart division={division} />
      </Grid>
      <Grid size={12}>
        <ScoresPerRoomChart divisionId={division._id} />
      </Grid>
      <Grid size={12}>
        <RobotCorrelationChart division={division} />
      </Grid>
    </Grid>
  );
};

export default JudgingInsightsDashboard;
