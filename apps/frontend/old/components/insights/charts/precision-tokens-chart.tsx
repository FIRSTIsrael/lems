import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Division } from '@lems/types';
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
import { apiFetch } from '../../../lib/utils/fetch';

interface PrecisionTokensChartProps {
  division: WithId<Division>;
}

const PrecisionTokensChart: React.FC<PrecisionTokensChartProps> = ({ division }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/api/divisions/${division._id}/insights/field/missions/precision-tokens`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [division._id]);

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
            <XAxis
              dataKey="tokens"
              label={{ value: 'אסימוני דיוק שנותרו', position: 'outsideCenter', dy: 14 }}
            />
            <YAxis textAnchor="left" yAxisId="left" />
            <YAxis dx={18} textAnchor="right" yAxisId="right" orientation="right" />
            <Legend wrapperStyle={{ bottom: -5 }} />
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
