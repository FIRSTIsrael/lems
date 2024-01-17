import { useState, useEffect } from 'react';
import { Card, Typography, SxProps, Theme } from '@mui/material';
import { apiFetch } from '../../lib/utils/fetch';

interface StatProps {
  title: string;
  url: string;
  unit?: string;
  precision?: number;
  sx?: SxProps<Theme>;
}

const Stat: React.FC<StatProps> = ({ title, url, unit, precision, sx }) => {
  const [data, setData] = useState<{ result: string | number } | null>(null);

  useEffect(() => {
    apiFetch(url).then(res => res.json().then(data => setData(data)));
  }, [url]);

  return (
    <Card sx={sx} variant="outlined">
      <Typography fontSize="1rem" fontWeight={500} textAlign="center">
        {title}
      </Typography>
      <Typography fontSize="2rem" textAlign="center" dir="ltr">
        {precision && typeof data?.result === 'number'
          ? Number(data?.result.toFixed(precision))
          : data?.result || 0}
        {unit}
      </Typography>
    </Card>
  );
};

export default Stat;
