import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Event } from '@lems/types';
import Stat from '../stat';
import { apiFetch } from '../../../lib/utils/fetch';
import AverageMedianCard from '../average-median-card';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FieldInsightsDashboardProps {
  event: WithId<Event>;
}

const FieldInsightsDashboard: React.FC<FieldInsightsDashboardProps> = ({ event }) => {
  const [missionSuccessRate, setMissionSuccessRate] = useState([]);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/field/missions/success-rate`).then(res =>
      res.json().then(data => setMissionSuccessRate(data))
    );
  }, []);

  return (
    <Grid container columnSpacing={2}>
      <Grid xs={4}>
        <AverageMedianCard
          title="ניקוד משחק הרובוט"
          color="#388e3c"
          url={`/api/events/${event._id}/insights/field/scores/all`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <AverageMedianCard
          title="ניקוד גבוה ביותר"
          color="#388e3c"
          url={`/api/events/${event._id}/insights/field/scores/top`}
          precision={2}
          sx={{ width: '100%', height: '100%' }}
        />
      </Grid>
      <Grid xs={4}>
        <Stat title="ציון ממוצע" value={100} sx={{ p: 2, width: '100%', height: '100%' }} />
      </Grid>
      <Grid xs={12}>
        <BarChart
          width={500}
          height={300}
          data={missionSuccessRate}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="successRate"
            fill="#8884d8"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
        </BarChart>
      </Grid>
    </Grid>
  );
};

export default FieldInsightsDashboard;
