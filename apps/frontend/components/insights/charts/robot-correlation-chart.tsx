import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Division } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { red } from '@mui/material/colors';

interface RobotCorrelationChartProps {
  division: WithId<Division>;
}

const RobotCorrelationChart: React.FC<RobotCorrelationChartProps> = ({ division }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(
      `/api/divisions/${division._id}/insights/judging/robot-room-correlation-to-robot-game`
    ).then(res => res.json().then(data => setData(data)));
  }, [division._id]);

  return (
    <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        ניקוד תכנון הרובוט לעומת ניקוד בזירה
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {data.length > 0 ? (
          <ScatterChart
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis name="ניקוד גבוה ביותר בזירה" dataKey="topRobotGameScore" type="number" />
            <YAxis
              name="ציון תכנון הרובוט ממוצע"
              dataKey="averageRobotDesignScore"
              textAnchor="left"
              domain={[0, 4]}
            />
            <Tooltip formatter={(value, name, props) => Number(Number(value).toFixed(2))} />
            <Scatter name="teams" data={data} fill={red[500]} />
          </ScatterChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default RobotCorrelationChart;
