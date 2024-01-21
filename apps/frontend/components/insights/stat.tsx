import { useState, useEffect } from 'react';
import { Card, Typography, SxProps, Theme, Box } from '@mui/material';
import { apiFetch } from '../../lib/utils/fetch';

interface StatProps {
  title: string;
  url: string;
  variant?: 'plain' | 'header';
  color?: string;
  unit?: string;
  precision?: number;
  sx?: SxProps<Theme>;
}

const Stat: React.FC<StatProps> = ({
  title,
  url,
  unit,
  precision,
  sx,
  variant = 'plain',
  color = '#fff'
}) => {
  const [data, setData] = useState<{ result: string | number } | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setData(data)));
  }, [url]);

  const getHeader = () => {
    if (variant === 'plain') {
      return (
        <Typography fontSize="1rem" fontWeight={500} textAlign="center" sx={{ pt: 2 }}>
          {title}
        </Typography>
      );
    }

    if (variant === 'header') {
      return (
        <Box p={1} textAlign="center" sx={{ backgroundColor: color }}>
          <Typography fontSize="1.5rem" fontWeight={700} color="#fff">
            {title}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Card sx={sx} variant="outlined">
      {getHeader()}
      <Typography fontSize="2rem" textAlign="center" dir="ltr" sx={{ py: 1 }}>
        {precision && typeof data?.result === 'number'
          ? Number(data?.result.toFixed(precision))
          : data?.result || 0}
        {unit}
      </Typography>
    </Card>
  );
};

export default Stat;
