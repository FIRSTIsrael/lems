import { useEffect, useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Skeleton, Typography } from '@mui/material';
import { Event, JudgingCategory, Team } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Text
} from 'recharts';
import { localizedJudgingCategory } from '@lems/season';

interface TeamProfileChartProps {
  event: WithId<Event>;
  team: WithId<Team> | null;
}

const TeamProfileChart: React.FC<TeamProfileChartProps> = ({ event, team }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (team)
      apiFetch(`/api/events/${event._id}/insights/team/${team._id}/judging-profile`).then(res =>
        res.json().then(data => setData(data))
      );
  }, [event._id, team]);

  const renderPolarAngleAxis = (props: any) => {
    const { payload, x, y, cx, cy, ...rest } = props;
    const category: JudgingCategory = payload.value;
    return (
      <Text {...rest} verticalAnchor="middle" y={y + (y - cy) / 6} x={x + (x - cx) / 6}>
        {localizedJudgingCategory[category].name}
      </Text>
    );
  };

  return (
    <>
      <Typography textAlign="center" fontSize="1.25rem" component="h2">
        פרופיל שיפוט
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        {team && data.length > 0 ? (
          <RadarChart outerRadius={120} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" tick={props => renderPolarAngleAxis(props)} />
            <PolarRadiusAxis angle={90} domain={[0, 4]} type="number" />
            <Radar
              name="team"
              dataKey="average"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
          </RadarChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </>
  );
};

export default TeamProfileChart;
