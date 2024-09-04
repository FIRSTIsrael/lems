import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Box, Stack } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import { getRelativePercentages } from '@lems/utils/arrays';
import { CompareContext } from './compare-view';
import { JudgingCategory } from '@lems/types';

interface CompareBatteryChartProps {
  category?: JudgingCategory;
  teamId: ObjectId;
}

const CompareBatteryChart: React.FC<CompareBatteryChartProps> = ({ category, teamId }) => {
  const { rubrics } = useContext(CompareContext);
  let competitorRubrics = rubrics.filter(r => r.teamId !== teamId);
  let teamRubrics = rubrics.filter(r => r.teamId === teamId);

  if (category) {
    competitorRubrics = competitorRubrics.filter(r => r.category === category);
    teamRubrics = teamRubrics.filter(r => r.category === category);
  }

  const teamScores = teamRubrics
    .flatMap(r => Object.entries(r.data?.values ?? {}))
    .reduce(
      (acc, [key, value]) => {
        acc[key] = value.value;
        return acc;
      },
      {} as Record<string, number>
    );

  const summary: Array<'W' | 'L' | 'T'> = Object.entries(teamScores).map(([clauseName, value]) => {
    const highestScore = Math.max(
      ...competitorRubrics.map(r => r.data?.values?.[clauseName]?.value ?? -1)
    );
    if (value > highestScore) return 'W';
    if (value < highestScore) return 'L';
    return 'T';
  });

  const percentages = getRelativePercentages(summary);

  return (
    <Stack height={50} direction="row" px={2}>
      <Box height="100%" width={`${percentages['W']}%`} bgcolor={green[500]} />
      <Box height="100%" width={`${percentages['T']}%`} bgcolor={yellow[500]} />
      <Box height="100%" width={`${percentages['L']}%`} bgcolor={red[500]} />
    </Stack>
  );
};

export default CompareBatteryChart;
