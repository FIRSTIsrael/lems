import { Card, Typography } from '@mui/material';

interface StatProps {
  title: string;
  value: string | number;
  unit?: string;
}

const Stat: React.FC<StatProps> = ({ title, value, unit }) => {
  return (
    <Card sx={{ p: 2, width: '100%', height: '100%' }} variant="outlined">
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
