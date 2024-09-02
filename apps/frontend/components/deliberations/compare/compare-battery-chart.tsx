import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Box, Stack } from '@mui/material';
import { green, yellow, red } from '@mui/material/colors';
import { CompareContext } from './compare-view';

interface CompareRubricRemarksProps {
  teamId: ObjectId;
}

const CompareBatteryChart: React.FC<CompareRubricRemarksProps> = ({ teamId }) => {
  const { category, rubrics } = useContext(CompareContext);

  // TODO: calculate number of leading tied and losing clauses
  // map each clause to a % of width
  // give each div that %

  return (
    <Stack height={50} direction="row" px={2}>
      <Box height="100%" width="33%" bgcolor={green[500]} />
      <Box height="100%" width="33%" bgcolor={yellow[500]} />
      <Box height="100%" width="33%" bgcolor={red[500]} />
    </Stack>
  );
};

export default CompareBatteryChart;
