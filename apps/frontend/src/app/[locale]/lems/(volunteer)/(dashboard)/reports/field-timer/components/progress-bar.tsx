import { LinearProgress, Box } from '@mui/material';

interface ProgressBarProps {
  percentRemaining: number;
}

const getColor = (percentRemaining: number) => {
  if (percentRemaining <= 25) return 'error';
  else if (percentRemaining <= 10) return 'warning';
  return 'primary';
};

export function ProgressBar({ percentRemaining }: ProgressBarProps) {
  const color = getColor(percentRemaining);

  return (
    <Box sx={{ mt: 0 }}>
      <LinearProgress
        variant="determinate"
        value={percentRemaining}
        color={color}
        sx={{
          height: 6,
          borderRadius: 3,
          mt: 2,
          backgroundColor: theme => theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.4s linear, background-color 0.3s ease',
            borderRadius: 3
          }
        }}
      />
    </Box>
  );
}
