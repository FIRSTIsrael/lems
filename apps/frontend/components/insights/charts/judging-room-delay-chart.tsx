import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { red, purple } from '@mui/material/colors';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Event } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface JudgingRoomDelayChartProps {
  event: WithId<Event>;
}

type JudgingRoomDelayChartData = Array<{ room: string; average: number; range: Array<number> }>;

const JudgingRoomDelayChart: React.FC<JudgingRoomDelayChartProps> = ({ event }) => {
  const [data, setData] = useState<JudgingRoomDelayChartData>([]);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/judging/delay`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [event._id]);

  return (
    <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        עיכוב חדרי שיפוט
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {data.length > 0 ? (
          <ComposedChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="room" />
            <YAxis unit="s" textAnchor="left" />
            <Tooltip />
            <Bar name="טווח עיכוב" dataKey="range" fill={purple[100]} />
            <Line name="עיכוב ממוצע" dataKey="average" stroke={red[600]} />
          </ComposedChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default JudgingRoomDelayChart;
