import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Event } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { blue } from '@mui/material/colors';

interface PrecisionTokensChartProps {
  event: WithId<Event>;
}

const PrecisionTokensChart: React.FC<PrecisionTokensChartProps> = ({ event }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/field/missions/precision-tokens`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [event._id]);

  return (
    <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        אסימוני דיוק
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {data.length > 0 ? (
          <ComposedChart
            data={data.sort((a, b) => a['tokens'] - b['tokens'])}
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5
            }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tokens" />
            <YAxis textAnchor="left" yAxisId="left" />
            <YAxis dx={18} textAnchor="right" yAxisId="right" orientation="right" />
            <Legend />
            <Tooltip formatter={(value, name, props) => Number(Number(value).toFixed(2))} />
            <Bar name="מספר הופעות" dataKey="count" fill={blue[400]} barSize={20} yAxisId="right" />
            <Area
              name="ניקוד ממוצע"
              type="monotone"
              dataKey="averageScore"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorScore)"
              yAxisId="left"
            />
          </ComposedChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default PrecisionTokensChart;