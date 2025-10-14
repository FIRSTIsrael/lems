import { Box, Card, Divider, Skeleton, Stack, Typography, SxProps, Theme } from '@mui/material';
import { apiFetch } from '../../lib/utils/fetch';
import { useEffect, useState } from 'react';

interface AverageMedianCardProps {
  title: string;
  color: string;
  url: string;
  precision?: number;
  sx?: SxProps<Theme>;
}

type AverageMedianStats = { average: string | number; median: string | number };

const AverageMedianCard: React.FC<AverageMedianCardProps> = ({
  title,
  color,
  url,
  precision,
  sx
}) => {
  const [stats, setStats] = useState<AverageMedianStats | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setStats(data)));
  }, [url]);

  return stats ? (
    <Card variant="outlined" sx={sx}>
      <Box p={1} textAlign="center" sx={{ backgroundColor: color }}>
        <Typography fontSize="1.5rem" fontWeight={700} sx={{ color: '#FFF' }}>
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
          <Typography color="textSecondary">ממוצע</Typography>
        </Stack>
        <Stack spacing={0} textAlign="center">
          <Typography fontWeight={600}>
            {precision && typeof stats.median === 'number'
              ? Number(stats.median.toFixed(precision))
              : stats.median}
          </Typography>
          <Typography color="textSecondary">חציון</Typography>
        </Stack>
      </Stack>
    </Card>
  ) : (
    <Skeleton variant="rounded" width="100%" height={106} />
  );
};

export default AverageMedianCard;
