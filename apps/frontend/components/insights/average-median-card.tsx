import { Box, Card, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { apiFetch } from 'apps/frontend/lib/utils/fetch';
import { useEffect, useState } from 'react';

interface AverageMedianCardProps {
  title: string;
  color: string;
  url: string;
  precision?: number;
}

type AverageMedianStats = { average: string | number; median: string | number };

const AverageMedianCard: React.FC<AverageMedianCardProps> = ({ title, color, url, precision }) => {
  const [stats, setStats] = useState<AverageMedianStats | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setStats(data)));
  }, [url]);

  return stats ? (
    <Card variant="outlined">
      <Box p={1} textAlign="center" sx={{ backgroundColor: color }}>
        <Typography fontSize="1.5rem" fontWeight={700} color="#fff">
          {title}
        </Typography>
      </Box>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        justifyContent="space-evenly"
        p={1}
      >
        <Stack spacing={0} textAlign="center">
          <Typography fontWeight={600}>
            {precision && typeof stats.average === 'number'
              ? Number(stats.average.toFixed(precision))
              : stats.average}
          </Typography>
          <Typography color="text.secondary">ממוצע</Typography>
        </Stack>
        <Stack spacing={0} textAlign="center">
          <Typography fontWeight={600}>
            {precision && typeof stats.median === 'number'
              ? Number(stats.median.toFixed(precision))
              : stats.median}
          </Typography>
          <Typography color="text.secondary">חציון</Typography>
        </Stack>
      </Stack>
    </Card>
  ) : (
    <Skeleton variant="rounded" width="100%" height={106} />
  );
};

export default AverageMedianCard;
