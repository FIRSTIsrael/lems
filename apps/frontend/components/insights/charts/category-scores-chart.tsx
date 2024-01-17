import { WithId } from 'mongodb';
import { red } from '@mui/material/colors';
import {
  Box,
  Card,
  Skeleton,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { apiFetch } from '../../../lib/utils/fetch';
import { useEffect, useState } from 'react';
import { Event, JudgingCategory } from '@lems/types';
import { localizedJudgingCategory } from '@lems/season';

interface CategoryScoresChartProps {
  event: WithId<Event>;
}

type CategoryScoresChartData = Array<{
  category: JudgingCategory;
  average: number;
  median: number;
}>;

const CategoryScoresChart: React.FC<CategoryScoresChartProps> = ({ event }) => {
  const [data, setData] = useState<CategoryScoresChartData | null>(null);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/insights/judging/scores/categories`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [event._id]);

  return data ? (
    <Card variant="outlined">
      <Box p={1} textAlign="center" sx={{ backgroundColor: red[600] }}>
        <Typography fontSize="1.5rem" fontWeight={700} color="#fff">
          ציוני תחומים
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>תחום</TableCell>
            <TableCell>ממוצע</TableCell>
            <TableCell>חציון</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(entry => (
            <TableRow key={entry.category}>
              <TableCell>{localizedJudgingCategory[entry.category].name}</TableCell>
              <TableCell>
                <Typography>{Number(entry.average.toFixed(2))}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{Number(entry.median.toFixed(2))}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ) : (
    <Skeleton variant="rounded" width="100%" height={106} />
  );
};

export default CategoryScoresChart;
