import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { green } from '@mui/material/colors';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Division } from '@lems/types';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { apiFetch } from '../../../lib/utils/fetch';

interface MissionSuccessRateChartProps {
  division: WithId<Division>;
}

const MissionSuccessRateChart: React.FC<MissionSuccessRateChartProps> = ({ division }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    apiFetch(`/api/divisions/${division._id}/insights/field/missions/success-rate`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [division._id]);

  return (
    <Paper sx={{ p: 2, width: '100%', height: '100%' }}>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        אחוז הצלחת משימות<sup>*</sup>
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        {data.length > 0 ? (
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" />
            <YAxis unit="%" textAnchor="left" />
            <Tooltip formatter={(value, name, props) => Number(Number(value).toFixed(2)) + '%'} />
            <Bar
              name="אחוז הצלחה"
              dataKey="successRate"
              fill={green[600]}
              activeBar={<Rectangle fill={green[300]} />}
            />
          </BarChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
      <Typography fontSize="0.8rem">
        <em>*משימה נחשבת הצלחה אם הניקוד בה גבוה מ-0</em>
      </Typography>
    </Paper>
  );
};

export default MissionSuccessRateChart;
