import { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import { Paper, Skeleton, Typography } from '@mui/material';
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
import { blue, green, red } from '@mui/material/colors';

interface ScoresPerRoomChartProps {
  divisionId: ObjectId;
  height?: number;
}

const ScoresPerRoomChart: React.FC<ScoresPerRoomChartProps> = ({ divisionId, height = 300 }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/api/divisions/${divisionId}/insights/judging/scores/rooms`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [divisionId]);

  return (
    <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        ניקוד לפי חדר
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
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
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d48794" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d48794" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="room" />
            <YAxis textAnchor="left" domain={[0, 4]} />
            <Tooltip formatter={(value, name, props) => Number(Number(value).toFixed(2))} />
            <Legend />
            <Area
              name="ממוצע ניקוד"
              type="monotone"
              dataKey="average"
              stroke="#d48794"
              fillOpacity={1}
              fill="url(#colorScore)"
            />
            <Bar name="פרויקט חדשנות" dataKey="innovation-project" fill={blue[400]} barSize={16} />
            <Bar name="תכנון הרובוט" dataKey="robot-design" fill={green[400]} barSize={16} />
            <Bar name="ערכי ליבה" dataKey="core-values" fill={red[400]} barSize={16} />
          </ComposedChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default ScoresPerRoomChart;
