import { Card, Typography, SxProps, Theme } from '@mui/material';

interface StatProps {
  title: string;
  value: string | number;
  unit?: string;
  sx?: SxProps<Theme>;
}

const Stat: React.FC<StatProps> = ({ title, value, unit, sx }) => {
  return (
    <Card sx={sx} variant="outlined">
      <Typography fontSize="1rem" fontWeight={500} textAlign="center">
        {title}
      </Typography>
      <Typography fontSize="2rem" textAlign="center">
        {value}
        {unit}
      </Typography>
    </Card>
  );
};

export default Stat;
