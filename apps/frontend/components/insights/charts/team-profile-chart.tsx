import { useEffect, useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import { Skeleton, Typography } from '@mui/material';
import { red, green, blue } from '@mui/material/colors';
import { Division, JudgingCategory, Team } from '@lems/types';
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
  division: WithId<Division>;
  team: WithId<Team> | null;
}

type TeamProfileChartData = Array<{
  _id: JudgingCategory;
  category: JudgingCategory;
  average: number;
  fullMark: number;
}>;

const TeamProfileChart: React.FC<TeamProfileChartProps> = ({ division, team }) => {
  const [data, setData] = useState<TeamProfileChartData>([]);

  useEffect(() => {
    if (team)
      apiFetch(`/api/divisions/${division._id}/insights/team/${team._id}/judging-profile`).then(
        res => res.json().then(data => setData(data))
      );
  }, [division._id, team]);

  const renderPolarAngleAxis = (props: any) => {
    const { payload, x, y, cx, cy, ...rest } = props;
    const category: JudgingCategory = payload.value;
    return (
      <Text {...rest} verticalAnchor="middle" y={y + (y - cy) / 6} x={x + (x - cx) / 6}>
        {localizedJudgingCategory[category].name}
      </Text>
    );
  };

  const color: string = useMemo(() => {
    const colors = {
      'innovation-project': blue[200],
      'core-values': red[200],
      'robot-design': green[200]
    };
    const sorted = structuredClone(data).sort((a, b) => b.average - a.average);
    if (sorted[0] === sorted[1]) return '#aaa';
    return colors[sorted[0].category];
  }, [data]);

  return (
    <>
      <ResponsiveContainer width="100%" height={320}>
        {team && data.length > 0 ? (
          <RadarChart outerRadius={120} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" tick={props => renderPolarAngleAxis(props)} />
            <PolarRadiusAxis angle={90} domain={[0, 4]} type="number" />
            <Radar name="team" dataKey="average" stroke={color} fill={color} fillOpacity={0.6} />
          </RadarChart>
        ) : (
          <Skeleton width="100%" height="100%" />
        )}
      </ResponsiveContainer>
    </>
  );
};

export default TeamProfileChart;
