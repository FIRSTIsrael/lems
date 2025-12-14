'use client';

import { Box } from '@mui/material';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function PlaceholderChart() {
  const colorOne = 'rgba(33, 150, 243, 0.35)';
  const colorTwo = 'rgba(33, 150, 243, 0.85)';
  const colorThree = '#1976d2';

  const data = [
    { name: 'Match 1', score: 120, teams: 55 },
    { name: 'Match 2', score: 98, teams: 65 },
    { name: 'Match 3', score: 140, teams: 75 },
    { name: 'Match 4', score: 110, teams: 60 },
    { name: 'Match 5', score: 130, teams: 62 },
    { name: 'Match 6', score: 115, teams: 56 }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 750, mx: 'auto', height: 400, mb: 4 }}>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          style={{ direction: 'ltr' }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Legend wrapperStyle={{ color: colorThree, fontWeight: 500 }} />
          <Bar dataKey="score" fill={colorOne} name="Top score" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="teams"
            name="Average"
            stroke={colorTwo}
            strokeWidth={3}
            dot={{ r: 4, stroke: colorTwo, fill: colorOne }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
