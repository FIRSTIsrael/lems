import { LinearProgress, Box } from '@mui/material';

interface ProgressBarProps {
  percentRemaining: number;
}

export function ProgressBar({ percentRemaining }: ProgressBarProps) {
  const isWarning = percentRemaining <= 25;
  const isDanger = percentRemaining <= 10;

  let color: 'primary' | 'error' | 'warning' = 'primary';
  if (isDanger) color = 'error';
  else if (isWarning) color = 'warning';

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
