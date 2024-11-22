import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { red } from '@mui/material/colors';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Division } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';

interface JudgingRoomDelayChartProps {
  division: WithId<Division>;
}

interface JudgingRoomDelayChartData {
  best: { room: string; average: number };
  worst: { room: string; average: number };
  average: number;
}

const JudgingRoomDelayChart: React.FC<JudgingRoomDelayChartProps> = ({ division }) => {
  const [data, setData] = useState<JudgingRoomDelayChartData | null>(null);

  useEffect(() => {
    apiFetch(`/api/divisions/${division._id}/insights/judging/delay`).then(res =>
      res.json().then(data => setData(data))
    );
  }, [division._id]);

  const getDuration = (seconds: number | undefined): string => {
    if (!seconds) return '00:00';
    const prefix = seconds < 0 ? '-' : '';
    const absoluteSeconds = Math.abs(seconds);
    return prefix + dayjs.duration(absoluteSeconds, 'seconds').format('mm:ss');
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <Box p={1} textAlign="center" sx={{ backgroundColor: red[600] }}>
        <Typography fontSize="1.5rem" fontWeight={700} sx={{ color: '#FFF' }}>
          עיכוב
        </Typography>
      </Box>
      <Grid container>
        <Grid sx={{ pt: 2 }} size={12}>
          <Typography fontWeight={500} fontSize="1.125rem" textAlign="center">
            עיכוב ממוצע
          </Typography>
          <Typography fontSize="1.75rem" dir="ltr" textAlign="center">
            {getDuration(data?.average)}
          </Typography>
        </Grid>
        <Grid mt={2} pt={2} borderTop={0.5} borderColor="#aaa" size={12}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            justifyContent="space-evenly"
            p={1}
          >
            <Stack spacing={0} textAlign="center">
              <Typography color="textSecondary">עיכוב מינימלי</Typography>
              <Typography dir="ltr" fontWeight={600}>
                {getDuration(data?.best.average)}
              </Typography>
              <Typography color="textSecondary">חדר {data?.best.room}</Typography>
            </Stack>
            <Stack spacing={0} textAlign="center">
              <Typography color="textSecondary">עיכוב מקסימלי</Typography>
              <Typography dir="ltr" fontWeight={600}>
                {getDuration(data?.worst.average)}
              </Typography>
              <Typography color="textSecondary">חדר {data?.worst.room}</Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
};

export default JudgingRoomDelayChart;
