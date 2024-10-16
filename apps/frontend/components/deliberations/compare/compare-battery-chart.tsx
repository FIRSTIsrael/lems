import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Box, Stack, Typography } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import { getCounts, getRelativePercentages } from '@lems/utils/arrays';
import { CompareContext } from './compare-view';

const WTL = ['W', 'T', 'L'] as const;
type WTLValues = (typeof WTL)[number];

interface CompareBatteryBoxProps {
  wtlValue: WTLValues;
  counts: Record<WTLValues, number>;
  percentages: Record<WTLValues, number>;
}

const CompareBatteryBox: React.FC<CompareBatteryBoxProps> = ({ wtlValue, counts, percentages }) => {
  const colors = { W: '#34c759', T: '#ffcc00', L: '#ff3b30' };
  return (
    counts[wtlValue] > 0 && (
      <Box
        height="100%"
        width={`${percentages[wtlValue]}%`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor={colors[wtlValue]}
      >
        {percentages[wtlValue] > 5 && (
          <Typography color="#333" sx={{ direction: 'rtl' }}>
            {counts[wtlValue]}{' '}
            {percentages[wtlValue] > 9 && <span>({Math.round(percentages[wtlValue])}%)</span>}
          </Typography>
        )}
      </Box>
    )
  );
};

interface CompareBatteryChartProps {
  teamId: ObjectId;
}

const CompareBatteryChart: React.FC<CompareBatteryChartProps> = ({ teamId }) => {
  const { rubrics, category } = useContext(CompareContext);
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

  const summary: Array<WTLValues> = Object.entries(teamScores).map(([clauseName, value]) => {
    const highestScore = Math.max(
      ...competitorRubrics.map(r => r.data?.values?.[clauseName]?.value ?? -1)
    );
    if (value > highestScore) return 'W';
    if (value < highestScore) return 'L';
    return 'T';
  });

  const counts = getCounts(summary);
  const percentages = getRelativePercentages(summary);

  return (
    <Stack height={50} direction="row" borderRadius={100} overflow="hidden" mx={2}>
      {WTL.map(wtl => (
        <CompareBatteryBox wtlValue={wtl} counts={counts} percentages={percentages} />
      ))}
    </Stack>
  );
};

export default CompareBatteryChart;
